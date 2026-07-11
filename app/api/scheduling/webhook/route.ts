import { NextResponse } from 'next/server';
import { bookingFromPayload, upsertAppointment, verifyCalComSignature } from '@/lib/scheduling';

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-cal-signature-256') || req.headers.get('cal-signature-256') || req.headers.get('x-cal-signature');
  if (!verifyCalComSignature(raw, signature)) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  let body: any;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const trigger = String(body?.triggerEvent || body?.event || '').toUpperCase();
  try {
    if (trigger.includes('CANCEL')) await upsertAppointment(bookingFromPayload(body), 'Cancelled');
    else if (trigger.includes('RESCHEDULE')) await upsertAppointment(bookingFromPayload(body), 'Rescheduled');
    else if (trigger.includes('CREATED') || trigger.includes('BOOKING')) await upsertAppointment(bookingFromPayload(body), 'Booked');
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: 'Webhook not processed' }, { status: 400 }); }
}
