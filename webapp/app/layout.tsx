// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CookieBotScript from '@/components/CookieBotScript';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ICA Next.js App',
  description: 'International Compliance Application',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
  {/* 🔥 COOKIEBOT DEVE ESSERE IL PRIMO ELEMENTO ASSOLUTO */}
  <CookieBotScript />
  
  {/* IMPORTANTE: nessun whitespace tra i tag */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  {/* Favicon e altri meta tag */}
  <link rel="icon" href="/favicon.ico" />
  <meta name="theme-color" content="#ffffff" />
</head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}