import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLead } from '@/lib/scoring';
import { sampleContractor } from '@/lib/mock-data';
import { sendEmail, sendSms } from '@/lib/notifications';

const numberOrNull = (value: FormDataEntryValue | null) => value ? Number(value) : null;
const stringOrNull = (value: FormDataEntryValue | null) => value ? String(value) : null;

export async function POST(req: Request) {
  const form = await req.formData();
  const data = Object.fromEntries(form.entries());
  const existingLeadId = stringOrNull(form.get('id'));

  if (existingLeadId) {
    const status = stringOrNull(form.get('status'));
    const redirectTo = stringOrNull(form.get('redirectTo')) || '/admin/leads';
    const salesData = form.has('estimateAmount') ? {
      estimateAmount: numberOrNull(form.get('estimateAmount')),
      jobValue: numberOrNull(form.get('jobValue')),
      closeDate: form.get('closeDate') ? new Date(String(form.get('closeDate'))) : null,
      salesNotes: stringOrNull(form.get('salesNotes')),
      assignedContractor: stringOrNull(form.get('assignedContractor')),
      revenueGenerated: numberOrNull(form.get('revenueGenerated')),
    } : {};
    try {
      await prisma.lead.update({
        where: { id: existingLeadId },
        data: { ...(status ? { status: status as any } : {}), ...salesData },
      });
    } catch (error) { console.warn('Mock lead update', error); }
    return NextResponse.redirect(new URL(redirectTo, req.url), 303);
  }

  const budget = Number(data.budget || 0);
  const ownsRents = String(data.ownsRents || 'Own');
  const ownsProperty = ownsRents !== 'RentNoApproval';
  const preferredContactMethod = String(data.preferredContactMethod || 'Phone');
  const leadScore = scoreLead({ phone: String(data.phone), budget, timeline: String(data.timeline), propertyType: String(data.propertyType), projectType: String(data.projectType), ownsProperty });
  const status = leadScore === 'LowFit' ? 'New' : 'Qualified';
  let leadId = 'mock-lead';
  try {
    const contractor = await prisma.contractor.upsert({ where: { email: process.env.ADMIN_EMAIL || sampleContractor.email }, update: {}, create: { name: sampleContractor.name, companyName: sampleContractor.companyName, email: process.env.ADMIN_EMAIL || sampleContractor.email, phone: sampleContractor.phone } });
    const lead = await prisma.lead.create({ data: { contractorId: contractor.id, name: String(data.name), phone: String(data.phone), email: String(data.email), zipCode: String(data.zipCode), projectType: String(data.projectType), propertyType: `${data.propertyType} · ${ownsRents}`, squareFootage: data.squareFootage ? Number(data.squareFootage) : null, budget, timeline: String(data.timeline), preferredContactMethod, notes: String(data.notes || ''), ownsProperty, leadScore, status } });
    leadId = lead.id;
  } catch (error) { console.warn('Database unavailable; using mock lead flow', error); }
  await sendEmail({ to: String(data.email), subject: 'Your free painting estimate request', body: `Thanks ${data.name}. We received your ${data.projectType} request and will follow up shortly to help schedule your free estimate.` });
  await sendEmail({ to: process.env.ADMIN_EMAIL || sampleContractor.email, subject: `New ${leadScore} painting estimate request`, body: `${data.name} requested an estimate in ${data.zipCode}. Budget: $${budget}. Timeline: ${data.timeline}. Lead: ${leadId}` });
  if (preferredContactMethod === 'SMS') await sendSms(String(data.phone), 'PaintLeadAI received your estimate request. We will follow up shortly.');
  return NextResponse.redirect(new URL(`/book/schedule?leadId=${leadId}`, req.url), 303);
}
