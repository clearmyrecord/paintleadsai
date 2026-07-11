import { Nav } from '@/components/Nav';
import { SchedulingEmbed } from '@/components/SchedulingEmbed';
import { prisma } from '@/lib/prisma';

export default async function Schedule({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await searchParams;
  if (!leadId || !/^c[a-z0-9]{20,}$/i.test(leadId)) return <Blocked message="We could not find that estimate request. Please submit the form before scheduling." />;
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true, name: true, email: true, phone: true, projectType: true, zipCode: true, notes: true, propertyType: true, timeline: true, budget: true } });
  if (!lead) return <Blocked message="That estimate request is no longer available. Please start again or contact support." />;
  const eventUrl = process.env.NEXT_PUBLIC_CALENDLY_EVENT_URL;
  const allowMock = process.env.NODE_ENV !== 'production' && !eventUrl;
  return <><Nav /><main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="mb-6"><p className="font-bold uppercase tracking-wide text-brand">Free estimate appointment</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Choose a Time for Your Free Painting Estimate</h1><p className="mt-3 text-lg text-slate-600">Select the date and time that works best for your schedule. We’ll confirm the appointment with your assigned painting contractor.</p></div><section className="card mb-6"><h2 className="text-xl font-black">Your project summary</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><b>Name:</b> {lead.name}</p><p><b>ZIP:</b> {lead.zipCode}</p><p><b>Project:</b> {lead.projectType}</p><p><b>Timeline:</b> {lead.timeline}</p><p><b>Budget:</b> ${lead.budget.toLocaleString()}</p><p><b>Property:</b> {lead.propertyType}</p></div>{lead.notes && <p className="mt-3 text-sm text-slate-600"><b>Notes:</b> {lead.notes}</p>}</section><SchedulingEmbed lead={lead} eventUrl={eventUrl} allowMock={allowMock} /></main></>;
}
function Blocked({ message }: { message: string }) { return <><Nav /><main className="mx-auto max-w-2xl px-6 py-16"><div className="card text-center"><h1 className="text-3xl font-black">Scheduling link unavailable</h1><p className="mt-3 text-slate-600">{message}</p><a className="btn-primary mt-6" href="/book">Start your estimate request</a></div></main></>; }
