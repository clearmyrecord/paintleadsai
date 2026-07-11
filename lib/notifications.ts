import { Resend } from 'resend';
import twilio from 'twilio';

type Notice = { to: string; subject: string; body: string; smsTo?: string };
export async function sendEmail({ to, subject, body }: Notice) {
  if (!process.env.RESEND_API_KEY) return { status: 'mocked', provider: 'resend' };
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: 'PaintLeadAI <noreply@paintleads.ai>', to, subject, text: body });
}
export async function sendSms(to: string, body: string) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) return { status: 'mocked', provider: 'twilio' };
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client.messages.create({ from: TWILIO_PHONE_NUMBER, to, body });
}

export async function scheduleAppointmentReminderPlaceholder(appointmentId: string, hoursBefore: 24 | 2) {
  return { status: 'placeholder', provider: 'twilio', appointmentId, hoursBefore, duplicateGuard: `reminder${hoursBefore}hSentAt` };
}
