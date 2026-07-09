import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'PaintLeadAI', description: 'Qualified painting estimates booked on your calendar' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
