import Link from 'next/link';

export function Nav() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-xl font-black text-brand">PaintLeadAI</Link>
      <div className="flex gap-3">
        <Link className="btn-secondary" href="/admin">Admin Login</Link>
        <Link className="btn-primary" href="/book">Get Free Estimate</Link>
      </div>
    </nav>
  );
}
