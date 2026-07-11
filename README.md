# PaintLeadAI

PaintLeadAI is a full-stack MVP for painting contractors to capture homeowner estimate requests, qualify leads, book estimate appointments, and manage show/no-show outcomes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Simple admin login
- Calendly embedded scheduling and webhook processing
- Resend email integration with mock fallback
- Twilio SMS integration with mock fallback

## Pages

- `/` homeowner/contractor landing page
- `/book` lead intake form
- `/book/schedule?leadId=...` homeowner Calendly scheduling step
- `/thank-you?leadId=...` homeowner confirmation with appointment details
- `/admin` CRM dashboard with upcoming appointments
- `/admin/leads` lead table
- `/admin/appointments` appointment list/calendar status management
- `/admin/settings` login and integration notes

## Environment variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
RESEND_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
ADMIN_EMAIL="admin@paintleads.ai"
NEXT_PUBLIC_CALENDLY_EVENT_URL=""
CALENDLY_PERSONAL_ACCESS_TOKEN=""
CALENDLY_WEBHOOK_SIGNING_KEY=""
CALENDLY_ORGANIZATION_URI=""
CALENDLY_USER_URI=""
```

Only `NEXT_PUBLIC_CALENDLY_EVENT_URL` is used in the browser. Keep `CALENDLY_PERSONAL_ACCESS_TOKEN` and `CALENDLY_WEBHOOK_SIGNING_KEY` server-only.

If Resend, Twilio, or PostgreSQL are unavailable, the app falls back to mock notifications and sample dashboard data. If Calendly is not configured, `/book/schedule` shows a mock scheduler in development only; production displays a clear unavailable message instead.

## Calendly scheduling

1. A homeowner submits `/book`.
2. The app saves the Lead and redirects to `/book/schedule?leadId=LEAD_ID`.
3. The scheduling page embeds the official Calendly inline widget using `NEXT_PUBLIC_CALENDLY_EVENT_URL`.
4. The embed pre-fills name and email, sends phone as a custom answer when supported, and includes the internal Lead ID in tracking/custom-answer metadata.
5. Calendly webhooks should point to `/api/scheduling/webhook` and use `CALENDLY_WEBHOOK_SIGNING_KEY` for signature verification.
6. The webhook handles `invitee.created` and `invitee.canceled`, upserts Appointments by Calendly invitee URI, updates Lead status to `AppointmentBooked`, and stores appointment links and meeting location.

## Setup

Use Node.js 20 or newer. The project pins compatible Next.js 15, React 19, Prisma 6, and Tailwind CSS 4 packages.

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

## Lead scoring rules

- **Hot**: budget over $1,500, timeline within 30 days, owns property, and valid phone.
- **Warm**: budget from $750-$1,500 and timeline within 30-90 days.
- **Low Fit**: budget under $750, renter, or vague project.

## Appointment outcomes

Admins can mark appointments as Showed, NoShow, Won, Lost, or Cancelled. NoShow appointments flag replacement tracking and mark the lead as Replacement Needed.
