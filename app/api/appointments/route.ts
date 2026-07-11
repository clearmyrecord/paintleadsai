import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { upsertAppointment } from '@/lib/scheduling';

const leadStatusByAppointment: Record<string, string> = { Showed: 'EstimateCompleted', NoShow: 'ReplacementNeeded', Won: 'Won', Lost: 'Lost', Cancelled: 'Contacted' };

export async function POST(req: Request) {
  const type = req.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    try {
      const body = await req.json();
      const appt = await upsertAppointment({ leadId: String(body.leadId), externalBookingId: String(body.externalBookingId), eventTypeId: null, scheduledAt: new Date(String(body.scheduledAt)), endsAt: body.endsAt ? new Date(String(body.endsAt)) : null, timezone: String(body.timezone || 'UTC'), locationType: 'mock', meetingLocation: String(body.meetingLocation || 'Mock appointment'), rescheduleUrl: null, cancellationUrl: null, cancellationReason: null }, 'Booked');
      return NextResponse.json({ id: appt.id });
    } catch (e) { return NextResponse.json({ error: 'Unable to create appointment' }, { status: 400 }); }
  }
  const form = await req.formData();
  const id = String(form.get('id'));
  const status = String(form.get('status'));
  try {
    const appt = await prisma.appointment.update({ where: { id }, data: { status: status as any, replacementNeeded: status === 'NoShow', cancellationReason: status === 'Cancelled' ? 'Cancelled by admin' : undefined } });
    const leadStatus = leadStatusByAppointment[status];
    if (leadStatus) await prisma.lead.update({ where: { id: appt.leadId }, data: { status: leadStatus as any } });
  } catch (e) { console.warn('Mock appointment update', e); }
  return NextResponse.redirect(new URL('/admin/appointments', req.url), 303);
}
