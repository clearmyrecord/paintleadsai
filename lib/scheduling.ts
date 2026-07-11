import crypto from 'crypto';
import { prisma } from './prisma';
import { sendEmail, sendSms } from './notifications';

export function verifyCalComSignature(raw: string, signature: string | null) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const sig = signature.replace(/^sha256=/, '');
  if (sig.length !== digest.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig));
}

export function bookingFromPayload(body: any) {
  const p = body?.payload || body;
  const leadId = String(p?.metadata?.leadId || p?.responses?.leadId?.value || p?.leadId || '');
  const externalBookingId = String(p?.bookingId || p?.uid || p?.id || '');
  return {
    leadId,
    externalBookingId,
    eventTypeId: p?.eventTypeId ? String(p.eventTypeId) : null,
    scheduledAt: new Date(String(p?.startTime || p?.start || p?.startsAt)),
    endsAt: p?.endTime || p?.end ? new Date(String(p.endTime || p.end)) : null,
    timezone: String(p?.timeZone || p?.timezone || 'UTC'),
    locationType: p?.location?.type ? String(p.location.type) : null,
    meetingLocation: String(p?.location?.address || p?.location?.value || p?.location || 'To be confirmed'),
    rescheduleUrl: p?.rescheduleUrl ? String(p.rescheduleUrl) : null,
    cancellationUrl: p?.cancelUrl || p?.cancellationUrl ? String(p.cancelUrl || p.cancellationUrl) : null,
    cancellationReason: p?.cancellationReason ? String(p.cancellationReason) : null,
  };
}

export async function upsertAppointment(input: ReturnType<typeof bookingFromPayload>, status: 'Booked'|'Rescheduled'|'Cancelled' = 'Booked') {
  if (!/^c[a-z0-9]{20,}$/i.test(input.leadId) || !input.externalBookingId || Number.isNaN(input.scheduledAt.getTime())) throw new Error('Invalid scheduling payload');
  const lead = await prisma.lead.findUnique({ where: { id: input.leadId }, include: { contractor: true } });
  if (!lead?.contractorId) throw new Error('Lead or contractor missing');
  const appt = await prisma.appointment.upsert({ where: { externalBookingId: input.externalBookingId }, update: { ...input, contractorId: lead.contractorId, status }, create: { ...input, contractorId: lead.contractorId, status } });
  await prisma.lead.update({ where: { id: lead.id }, data: { status: status === 'Cancelled' ? lead.status : 'AppointmentBooked' } });
  if (status !== 'Cancelled') {
    await sendEmail({ to: lead.email, subject: 'Your painting estimate appointment is confirmed', body: `Hi ${lead.name}, your ${lead.projectType} estimate is scheduled for ${appt.scheduledAt.toLocaleString()} (${appt.timezone}). Location: ${appt.meetingLocation || 'To be confirmed'}.` });
    if (lead.contractor?.email) await sendEmail({ to: lead.contractor.email, subject: `New estimate appointment: ${lead.name}`, body: `${lead.name} booked ${lead.projectType} in ${lead.zipCode} for ${appt.scheduledAt.toLocaleString()} (${appt.timezone}).` });
    await sendSms(lead.phone, '[Placeholder] SMS confirmation/reminders via Twilio will be sent when enabled.');
  }
  return appt;
}
