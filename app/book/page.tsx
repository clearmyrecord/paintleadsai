import { Nav } from '@/components/Nav';

export default function Book() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="card p-8">
          <p className="font-bold uppercase tracking-wide text-brand">Free local painting estimate</p>
          <h1 className="mt-2 text-4xl font-black">Tell us about your painting project</h1>
          <p className="mt-3 text-lg text-slate-600">We’ll use these details to match you with a qualified painting contractor and help confirm a no-obligation estimate appointment.</p>
          <form action="/api/leads" method="post" className="mt-8 grid gap-4 md:grid-cols-2">
            <input className="input" name="name" placeholder="Full name" required />
            <input className="input" name="phone" placeholder="Phone number" required />
            <input className="input" type="email" name="email" placeholder="Email address" required />
            <input className="input" name="zipCode" placeholder="Project ZIP code" required />
            <select className="input" name="projectType" required>
              <option>Interior Painting</option><option>Exterior Painting</option><option>Cabinet Painting</option><option>Commercial Painting</option><option>Deck/Fence Staining</option><option>Not Sure</option><option>Other</option>
            </select>
            <select className="input" name="propertyType" required>
              <option>Single-family home</option><option>Townhome</option><option>Condo</option><option>Apartment</option><option>Commercial property</option><option>Rental property</option>
            </select>
            <select className="input" name="ownsRents" required>
              <option value="Own">I own the property</option><option value="RentWithApproval">I rent and have approval</option><option value="RentNoApproval">I rent and need approval</option>
            </select>
            <select className="input" name="timeline" required>
              <option>ASAP</option><option>Within 30 days</option><option>30-90 days</option><option>Just researching</option>
            </select>
            <input className="input" type="number" name="budget" placeholder="Estimated budget" required />
            <input className="input" type="number" name="squareFootage" placeholder="Approx. square footage" />
            <textarea className="input md:col-span-2" name="notes" placeholder="Tell us what needs painting, current condition, colors, access notes, or preferred appointment times" rows={5} />
            <p className="text-sm text-slate-500 md:col-span-2">By submitting, you agree to be contacted about your painting estimate request. Your estimate is free and no-obligation.</p>
            <button className="btn-primary md:col-span-2" type="submit">Get My Free Estimate</button>
          </form>
        </div>
      </main>
    </>
  );
}
