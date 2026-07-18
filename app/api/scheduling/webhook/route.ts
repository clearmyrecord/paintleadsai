import { NextResponse } from 'next/server';
import { calendlyBookingFromPayload, cancelAppointmentByInviteeUri, verifyCalendlySignature, upsertAppointment } from '@/lib/scheduling';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('calendly-webhook-signature');
  if (!verifyCalendlySignature(raw, signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const event = String(body?.event || '').toLowerCase();
  try {
    if (event === 'invitee.created') await upsertAppointment(calendlyBookingFromPayload(body), 'Booked');
    else if (event === 'invitee.canceled') {
      const booking = calendlyBookingFromPayload(body);
      await cancelAppointmentByInviteeUri(booking.externalInviteeUri || booking.externalBookingId, booking.cancellationReason);
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Webhook not processed' }, { status: 400 }); }
}
