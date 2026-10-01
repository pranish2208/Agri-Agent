import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppShell } from '../components/layout/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgriAgent | AI Agent for Farmer Decision Support',
  description: 'Professional, farmer-friendly agricultural decision-support platform for crop health, soil testing, weather forecasting, and mandi market prices.',
  keywords: ['AgriAgent', 'Agriculture AI', 'Crop Health', 'BharatAgentic', 'Farmer Assistant', 'Soil Testing', 'Mandi Prices'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${inter.className} min-h-full bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
