'use client';

import { useMemo, useState } from 'react';

type LeadSummary = { id: string; name: string; email: string; phone: string; projectType: string; zipCode: string; notes?: string | null };

type Props = { lead: LeadSummary; eventUrl?: string; allowMock: boolean };

const mockTimes = ['Tomorrow at 9:00 AM', 'Tomorrow at 1:30 PM', 'Friday at 10:00 AM', 'Saturday at 11:00 AM'];

export function SchedulingEmbed({ lead, eventUrl, allowMock }: Props) {
  const [loading, setLoading] = useState(Boolean(eventUrl));
  const [error, setError] = useState('');
  const src = useMemo(() => {
    if (!eventUrl) return '';
    const url = new URL(eventUrl);
    url.searchParams.set('metadata[leadId]', lead.id);
    url.searchParams.set('name', lead.name);
    url.searchParams.set('email', lead.email);
    return url.toString();
  }, [eventUrl, lead]);

  async function bookMock(label: string) {
    setLoading(true);
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch('/api/appointments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ leadId: lead.id, scheduledAt, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, externalBookingId: `mock-${lead.id}-${Date.now()}`, meetingLocation: label, provider: 'mock' }) });
    if (res.ok) window.location.href = `/thank-you?leadId=${lead.id}`;
    else setError('We could not reserve that time. Please try another appointment slot.');
    setLoading(false);
  }

  if (!eventUrl && !allowMock) return <div className="card border-red-200 bg-red-50 text-red-800">Online scheduling is temporarily unavailable. Please contact us and we’ll help book your estimate.</div>;

  return <div className="card overflow-hidden p-0">
    {loading && <div className="p-6 text-center text-slate-600">Loading available appointment times…</div>}
    {error && <div className="m-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {src ? <iframe title="Painting estimate scheduling calendar" src={src} onLoad={() => setLoading(false)} onError={() => { setLoading(false); setError('The scheduling calendar could not load. Please refresh or contact us for help.'); }} className="h-[760px] w-full border-0" /> : <div className="p-6">
      <p className="font-bold text-brand">Development mock calendar</p><p className="mt-2 text-slate-600">Cal.com is not configured. These sample times are available only outside production.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{mockTimes.map((t) => <button key={t} onClick={() => bookMock(t)} className="btn-secondary">{t}</button>)}</div>
    </div>}
  </div>;
}
