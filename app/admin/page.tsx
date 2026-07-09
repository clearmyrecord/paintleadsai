import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { getStats } from '@/lib/data';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default async function Admin() {
  const s = await getStats();
  const stats = [
    ['Total leads', s.totalLeads],
    ['Qualified leads', s.qualifiedLeads],
    ['Appointments booked', s.appointmentsBooked],
    ['Show rate', `${s.showRate}%`],
    ['No-show rate', `${s.noShowRate}%`],
    ['Deals won', s.dealsWon],
    ['Estimated revenue', currency.format(s.estimatedRevenue)],
    ['Lead-to-appointment conversion', `${s.leadToAppointmentConversion}%`],
    ['Appointment-to-sale conversion', `${s.appointmentToSaleConversion}%`],
  ];
  return <main className="mx-auto max-w-7xl px-6 py-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-bold uppercase tracking-wide text-brand">PaintLeadAI backend</p><h1 className="text-4xl font-black">Lead, appointment, and sales dashboard</h1></div><div className="flex flex-wrap gap-3"><Link className="btn-secondary" href="/admin/leads">Leads</Link><Link className="btn-secondary" href="/admin/appointments">Appointments</Link><Link className="btn-secondary" href="/admin/sales">Sales</Link><Link className="btn-secondary" href="/admin/settings">Settings</Link></div></div><div className="mt-8 grid gap-4 md:grid-cols-3">{stats.map(([l,v])=><StatCard key={l} label={String(l)} value={v}/>)}</div></main>;
}
