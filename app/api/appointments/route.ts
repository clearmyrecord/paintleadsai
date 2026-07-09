import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const leadStatusByAppointment: Record<string, string> = {
  Showed: 'EstimateCompleted',
  NoShow: 'ReplacementNeeded',
  Won: 'Won',
  Lost: 'Lost',
};

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get('id'));
  const status = String(form.get('status'));
  try {
    const appt = await prisma.appointment.update({ where: { id }, data: { status: status as any, replacementNeeded: status === 'NoShow' } });
    const leadStatus = leadStatusByAppointment[status];
    if (leadStatus) await prisma.lead.update({ where: { id: appt.leadId }, data: { status: leadStatus as any } });
  } catch (e) { console.warn('Mock appointment update', e); }
  return NextResponse.redirect(new URL('/admin/appointments', req.url), 303);
}
