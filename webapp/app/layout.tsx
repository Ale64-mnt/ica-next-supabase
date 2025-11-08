// app/layout.tsx
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

// Viewport (Next.js 14)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

// Metadata (senza viewport dentro)
export const metadata: Metadata = {
  title: 'EduEthica -We promote financial and ethical education',
  description: 'Progetto Next.js con Supabase e i18n'
};

// Root layout: unico punto con <html>/<body>
// Nota: il lang qui è statico per evitare mismatch.
// Se in futuro vuoi dinamico, spostalo nel layout locale oppure leggi la locale dal pathname.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
