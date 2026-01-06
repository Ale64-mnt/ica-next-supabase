// app/layout.tsx - VERSIONE SEMPLIFICATA E SICURA
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ICA Next.js App',
    template: '%s | ICA Next.js App',
  },
  description: 'International Compliance Application',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'none',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        {/* 🔥 SOLUZIONE: Inserisci direttamente lo script Cookiebot */}
        {/* NESSUN COMPONENTE REACT, NESSUN "use client" */}
        <script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779"
          data-blockingmode="auto"
          data-culture="IT"
          async
        />
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}