import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLead } from '@/lib/scoring';
import { sampleContractor } from '@/lib/mock-data';
import { sendEmail, sendSms } from '@/lib/notifications';

export async function POST(req: Request) {
  const form = await req.formData();
  const data = Object.fromEntries(form.entries());
  const budget = Number(data.budget || 0);
  const ownsProperty = data.ownsProperty === 'on';
  const leadScore = scoreLead({ phone: String(data.phone), budget, timeline: String(data.timeline), propertyType: String(data.propertyType), projectType: String(data.projectType), ownsProperty });
  const status = leadScore === 'LowFit' ? 'New' : 'Qualified';
  let leadId = 'mock-lead';
  try {
    const contractor = await prisma.contractor.upsert({ where: { email: process.env.ADMIN_EMAIL || sampleContractor.email }, update: {}, create: { name: sampleContractor.name, companyName: sampleContractor.companyName, email: process.env.ADMIN_EMAIL || sampleContractor.email, phone: sampleContractor.phone } });
    const lead = await prisma.lead.create({ data: { contractorId: contractor.id, name: String(data.name), phone: String(data.phone), email: String(data.email), zipCode: String(data.zipCode), projectType: String(data.projectType), propertyType: String(data.propertyType), squareFootage: data.squareFootage ? Number(data.squareFootage) : null, budget, timeline: String(data.timeline), preferredContactMethod: String(data.preferredContactMethod), notes: String(data.notes || ''), ownsProperty, leadScore, status } });
    leadId = lead.id;
  } catch (error) { console.warn('Database unavailable; using mock lead flow', error); }
  await sendEmail({ to: String(data.email), subject: 'Your painting estimate request', body: `Thanks ${data.name}. Your project is ${leadScore}; we will confirm an estimate time shortly.` });
  await sendEmail({ to: process.env.ADMIN_EMAIL || sampleContractor.email, subject: `New ${leadScore} painting lead`, body: `${data.name} requested an estimate in ${data.zipCode}. Budget: $${budget}. Timeline: ${data.timeline}. Lead: ${leadId}` });
  if (String(data.preferredContactMethod) === 'SMS') await sendSms(String(data.phone), 'PaintLeadAI received your estimate request. We will follow up shortly.');
  return NextResponse.redirect(new URL('/thank-you', req.url), 303);
}
