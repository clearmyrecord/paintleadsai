import { prisma } from './prisma';
import { dashboardStats, sampleAppointments, sampleLeads } from './mock-data';
export async function getLeads(){ try { return await prisma.lead.findMany({ orderBy:{ createdAt:'desc' } }); } catch { return sampleLeads as any; } }
export async function getAppointments(){ try { return await prisma.appointment.findMany({ include:{ lead:true }, orderBy:{ scheduledAt:'asc' } }); } catch { return sampleAppointments as any; } }
export async function getStats(){ const leads:any[] = await getLeads(); const appts:any[] = await getAppointments(); return { ...dashboardStats, totalLeads: leads.length, qualifiedLeads: leads.filter(l=>['Hot','Warm'].includes(l.leadScore)).length, bookedEstimates: appts.length, closedJobs: leads.filter(l=>l.status==='Won').length }; }
