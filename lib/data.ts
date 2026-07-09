import { prisma } from './prisma';
import { dashboardStats, sampleAppointments, sampleLeads } from './mock-data';

const wonStatuses = ['Won'];
const appointmentStatuses = ['AppointmentBooked', 'EstimateCompleted', 'NoShow', 'Won', 'Lost', 'ReplacementNeeded'];

export async function getLeads() {
  try { return await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } }); } catch { return sampleLeads as any; }
}

export async function getAppointments() {
  try { return await prisma.appointment.findMany({ include: { lead: true }, orderBy: { scheduledAt: 'asc' } }); } catch { return sampleAppointments as any; }
}

export async function getStats() {
  const leads: any[] = await getLeads();
  const appts: any[] = await getAppointments();
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified' || ['Hot', 'Warm'].includes(l.leadScore)).length;
  const appointmentsBooked = leads.filter((l) => appointmentStatuses.includes(l.status)).length || appts.length;
  const noShows = leads.filter((l) => l.status === 'NoShow' || l.status === 'ReplacementNeeded').length + appts.filter((a) => a.status === 'NoShow').length;
  const showed = leads.filter((l) => ['EstimateCompleted', 'Won', 'Lost'].includes(l.status)).length + appts.filter((a) => ['Showed', 'Won', 'Lost'].includes(a.status)).length;
  const dealsWon = leads.filter((l) => wonStatuses.includes(l.status)).length;
  const estimatedRevenue = leads.reduce((sum, l) => sum + Number(l.revenueGenerated || l.jobValue || 0), 0);
  const showRate = appointmentsBooked ? Math.round((showed / appointmentsBooked) * 100) : dashboardStats.showRate;
  const noShowRate = appointmentsBooked ? Math.round((noShows / appointmentsBooked) * 100) : dashboardStats.noShowRate;
  return {
    totalLeads,
    qualifiedLeads,
    appointmentsBooked,
    showRate,
    noShowRate,
    dealsWon,
    estimatedRevenue,
    leadToAppointmentConversion: totalLeads ? Math.round((appointmentsBooked / totalLeads) * 100) : 0,
    appointmentToSaleConversion: appointmentsBooked ? Math.round((dealsWon / appointmentsBooked) * 100) : 0,
  };
}
