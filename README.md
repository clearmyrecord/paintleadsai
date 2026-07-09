# PaintLeadAI

PaintLeadAI is a full-stack MVP for painting contractors to capture homeowner estimate requests, qualify leads, book appointments, and manage show/no-show outcomes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Simple admin login
- Resend email integration with mock fallback
- Twilio SMS integration with mock fallback
- Internal booking and appointment status flow

## Pages

- `/` homeowner/contractor landing page
- `/book` lead intake and booking form
- `/thank-you` homeowner confirmation
- `/admin` CRM dashboard
- `/admin/leads` lead table
- `/admin/appointments` appointment status management
- `/admin/settings` login and integration notes

## Environment variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
RESEND_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
ADMIN_EMAIL="admin@paintleads.ai"
```

If Resend, Twilio, or PostgreSQL are unavailable, the app falls back to mock notifications and sample dashboard data.

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

Admins can mark appointments as Showed, NoShow, Won, or Lost. NoShow appointments flag replacement tracking and mark the lead as Replacement Needed.
