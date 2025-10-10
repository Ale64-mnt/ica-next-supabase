// app/layout.tsx
import { ReactNode } from 'react';
import { Metadata } from 'next'; 
import './globals.css'; // Importa gli stili globali qui

// Viewport export separato (Next.js 14)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

// Metadata senza viewport
export const metadata: Metadata = {
  title: 'ICA Next Supabase App',
  description: 'Progetto Next.js con Supabase e i18n',
};

// Il RootLayout deve solo wrappare i Children (che saranno il Layout Locale)
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Il tag HTML è qui, ma la lingua viene gestita dal layout locale
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}