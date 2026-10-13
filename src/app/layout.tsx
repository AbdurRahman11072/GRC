import type { Metadata } from 'next';
import StoreProvider from '../providers/store-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zio Tech GRC — Audit Management & Compliance Platform',
  description:
    'Enterprise IS audit and regulatory compliance SaaS with multi-year scoring and 4-team collaborative boundary.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
