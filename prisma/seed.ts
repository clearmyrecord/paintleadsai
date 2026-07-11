import { PrismaClient } from '@prisma/client';
import { scoreLead } from '../lib/scoring';
const prisma = new PrismaClient();
async function main(){
 const contractor = await prisma.contractor.upsert({ where:{ email: process.env.ADMIN_EMAIL || 'admin@paintleads.ai' }, update:{}, create:{ name:'Avery Brooks', companyName:'Brooks Premier Painting', email:process.env.ADMIN_EMAIL || 'admin@paintleads.ai', phone:'+15551234567' }});
 const leads = [
  ['Mia Carter','(555) 010-1100','mia@example.com','30301','Interior painting','Single-family home',2200,3200,'Within 30 days','Phone','Kitchen, foyer, and bedrooms.',true],
  ['Noah Patel','(555) 010-2200','noah@example.com','30305','Exterior painting','Townhome',1800,1250,'30-90 days','Email','HOA color approval pending.',true],
  ['Sofia Lee','(555) 010-3300','sofia@example.com','30030','Not sure','Renter',900,500,'Just researching','SMS','Apartment touch-up.',false]
 ] as const;
 for (const [name,phone,email,zipCode,projectType,propertyType,squareFootage,budget,timeline,preferredContactMethod,notes,ownsProperty] of leads){
  const leadScore = scoreLead({ phone, budget, timeline, propertyType, projectType, ownsProperty });
  await prisma.lead.upsert({ where:{ email }, update:{}, create:{ contractorId:contractor.id,name,phone,email,zipCode,projectType,propertyType,squareFootage,budget,timeline,preferredContactMethod,notes,ownsProperty,leadScore,status: leadScore==='LowFit'?'ReplacementNeeded':'Qualified' }});
 }
 const mia = await prisma.lead.findUnique({ where:{ email:'mia@example.com' }});
 if (mia) await prisma.appointment.create({ data:{ contractorId:contractor.id, leadId:mia.id, scheduledAt:new Date(Date.now()+86400000), status:'Booked', externalBookingId:'seed-mia-appointment', timezone:'America/New_York', meetingLocation:'Customer home' }});
 await prisma.campaign.create({ data:{ contractorId:contractor.id, name:'Spring exterior estimates', source:'Meta Ads', budget:2500 }});
 await prisma.serviceArea.createMany({ data:['30301','30305','30030'].map(zipCode=>({ contractorId:contractor.id, zipCode })), skipDuplicates:true });
}
main().finally(()=>prisma.$disconnect());
