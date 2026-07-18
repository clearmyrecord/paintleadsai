ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'Confirmed';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'Rescheduled';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'Cancelled';

ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'calendly',
  ADD COLUMN IF NOT EXISTS "externalBookingId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalEventUri" TEXT,
  ADD COLUMN IF NOT EXISTS "externalInviteeUri" TEXT,
  ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS "meetingLocation" TEXT,
  ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "rescheduleUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "cancellationUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "reminder24HourSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reminder2HourSentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Appointment" SET "externalBookingId" = "id" WHERE "externalBookingId" IS NULL;
ALTER TABLE "Appointment" ALTER COLUMN "externalBookingId" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_externalBookingId_key" ON "Appointment"("externalBookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_externalInviteeUri_key" ON "Appointment"("externalInviteeUri");
CREATE INDEX IF NOT EXISTS "Appointment_externalEventUri_idx" ON "Appointment"("externalEventUri");
CREATE INDEX IF NOT EXISTS "Appointment_leadId_idx" ON "Appointment"("leadId");
CREATE INDEX IF NOT EXISTS "Appointment_contractorId_idx" ON "Appointment"("contractorId");
CREATE INDEX IF NOT EXISTS "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");
