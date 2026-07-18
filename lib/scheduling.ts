import crypto from 'crypto';
import { prisma } from './prisma';
import { sendEmail, sendSms } from './notifications';

type AppointmentInput = {
  leadId: string;
  externalBookingId: string;
  externalEventUri?: string | null;
  externalInviteeUri?: string | null;
  scheduledAt: Date;
  endsAt?: Date | null;
  timezone: string;
  meetingLocation?: string | null;
  rescheduleUrl?: string | null;
  cancellationUrl?: string | null;
  cancellationReason?: string | null;
  provider?: string;
};

const clean = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 500) : '';

export function verifyCalendlySignature(raw: string, signature: string | null) {
  const secret = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!secret || !signature) return false;
  const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=').map((v) => v.trim())));
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;
  const digest = crypto.createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');
  if (digest.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
}

function findAnswer(payload: any, labels: string[]) {
  const answers = Array.isArray(payload?.questions_and_answers) ? payload.questions_and_answers : [];
  const found = answers.find((a: any) => labels.some((label) => clean(a?.question).toLowerCase().includes(label)));
  return clean(found?.answer);
}

export function calendlyBookingFromPayload(body: any): AppointmentInput {
  const p = body?.payload || {};
  const event = p?.scheduled_event || {};
  const inviteeUri = clean(p?.uri);
  const eventUri = clean(event?.uri);
  const leadId = clean(p?.tracking?.utm_content) || clean(p?.tracking?.salesforce_uuid) || findAnswer(p, ['lead id', 'leadid', 'request id']) || clean(p?.leadId);
  const location = event?.location;
  const meetingLocation = clean(location?.join_url) || clean(location?.location) || clean(location?.type) || 'To be confirmed';
  return {
    leadId,
    externalBookingId: inviteeUri || eventUri,
    externalInviteeUri: inviteeUri || null,
    externalEventUri: eventUri || null,
    scheduledAt: new Date(clean(event?.start_time)),
    endsAt: event?.end_time ? new Date(clean(event.end_time)) : null,
    timezone: clean(p?.timezone) || clean(event?.timezone) || 'UTC',
    meetingLocation,
    rescheduleUrl: clean(p?.reschedule_url) || null,
    cancellationUrl: clean(p?.cancel_url) || null,
    cancellationReason: clean(p?.cancellation?.reason) || null,
    provider: 'calendly',
  };
}

export async function upsertAppointment(input: AppointmentInput, status: 'Booked'|'Rescheduled'|'Cancelled' = 'Booked') {
  if (!/^c[a-z0-9]{20,}$/i.test(input.leadId) || !input.externalBookingId || Number.isNaN(input.scheduledAt.getTime())) throw new Error('Invalid scheduling payload');
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId }, include: { contractor: true } });
  if (!lead?.contractorId) throw new Error('Lead or contractor missing');
  const data = { ...input, provider: input.provider || 'calendly', contractorId: lead.contractorId, status };
  const appt = await prisma.appointment.upsert({ where: { externalBookingId: input.externalBookingId }, update: data, create: data });
  if (status !== 'Cancelled') await prisma.lead.update({ where: { id: lead.id }, data: { status: 'AppointmentBooked' } });
  if (status !== 'Cancelled') {
    await sendEmail({ to: lead.email, subject: 'Your painting estimate appointment is confirmed', body: `Hi ${lead.name}, your ${lead.projectType} estimate is scheduled for ${appt.scheduledAt.toLocaleString()} (${appt.timezone}). Location: ${appt.meetingLocation || 'To be confirmed'}.` });
    if (lead.contractor?.email) await sendEmail({ to: lead.contractor.email, subject: `New estimate appointment: ${lead.name}`, body: `${lead.name} booked ${lead.projectType} in ${lead.zipCode} for ${appt.scheduledAt.toLocaleString()} (${appt.timezone}).` });
    await sendSms(lead.phone, '[Placeholder] SMS confirmation/reminders via Twilio will be sent when enabled.');
  }
  return appt;
}

export async function cancelAppointmentByInviteeUri(externalInviteeUri: string, cancellationReason?: string | null) {
  if (!externalInviteeUri) throw new Error('Missing Calendly invitee URI');
  return prisma.appointment.update({ where: { externalInviteeUri }, data: { status: 'Cancelled', cancellationReason: cancellationReason || null } });
}
