import Link from 'next/link';
import { Nav } from '@/components/Nav';

const services = [
  ['Interior Painting', 'Refresh bedrooms, kitchens, living areas, trim, ceilings, and whole-home interiors.'],
  ['Exterior Painting', 'Protect and update siding, brick, stucco, doors, shutters, decks, and fences.'],
  ['Cabinet Painting', 'Give kitchens and built-ins a clean, durable finish without a full replacement.'],
  ['Commercial Painting', 'Request estimates for offices, retail spaces, rental turns, and light commercial projects.'],
];

const trustItems = [
  ['Licensed & insured pros', 'We work to match homeowners with qualified local painting contractors who carry professional coverage.'],
  ['Fast scheduling', 'Share your project details once and get help coordinating the next available estimate window.'],
  ['Budget confirmation', 'We ask upfront budget and project details so your contractor can arrive prepared.'],
  ['No-obligation estimates', 'Compare your options with a free estimate before deciding whether to move forward.'],
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="bg-gradient-to-br from-blue-50 via-white to-orange-50 px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="mb-4 font-bold uppercase tracking-wide text-brand">Local painting estimates for homeowners</p>
              <h1 className="text-5xl font-black tracking-tight text-slate-950 md:text-6xl">Get a Free Painting Estimate From a Trusted Local Pro</h1>
              <p className="mt-6 text-xl leading-8 text-slate-700">Tell us about your project and we’ll match you with a qualified painting contractor in your area.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link className="btn-primary text-lg" href="/book">Get My Free Estimate</Link>
                <a className="btn-secondary" href="#services">See Services</a>
              </div>
              <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
                {['Interior & exterior projects', 'Cabinets and trim', 'Clear scope and budget review', 'No-obligation appointments'].map((item) => (
                  <div key={item} className="flex items-center gap-2"><span className="text-brand">✓</span>{item}</div>
                ))}
              </div>
            </div>
            <div className="card bg-white/95 p-8">
              <p className="text-sm font-bold uppercase tracking-wide text-brand">Start here</p>
              <h2 className="mt-2 text-3xl font-black">Tell us what needs painting.</h2>
              <p className="mt-3 text-slate-600">Answer a few quick questions about your home, timeline, and budget. We’ll route your request to a local painting professional for follow-up.</p>
              <div className="mt-6 space-y-4">
                {['Share your ZIP code and project type', 'Confirm ownership, timeline, and budget', 'Get contacted to schedule your free estimate'].map((step, i) => (
                  <div key={step} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-100 font-bold text-brand">{i + 1}</span>
                    <span className="font-semibold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>
              <Link className="btn-primary mt-6 w-full" href="/book">Get My Free Estimate</Link>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-3xl">
            <p className="font-bold uppercase tracking-wide text-brand">Painting services</p>
            <h2 className="mt-2 text-4xl font-black">Find the right pro for your project.</h2>
            <p className="mt-4 text-lg text-slate-600">From a single room to an exterior repaint, PaintLeadAI helps homeowners request estimates from local contractors who handle the work you need.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map(([title, body]) => (
              <div className="card" key={title}>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-3 text-slate-600">{body}</p>
                <Link className="mt-5 inline-block font-bold text-brand" href="/book">Request estimate →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 px-6 py-16 text-white">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-4">
              {trustItems.map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-3 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-3xl bg-white p-8 text-slate-950 md:flex md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-black">Ready for a fresh coat?</h2>
                <p className="mt-2 text-slate-600">Request your free painting estimate in under two minutes.</p>
              </div>
              <Link className="btn-primary mt-6 md:mt-0" href="/book">Get My Free Estimate</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
