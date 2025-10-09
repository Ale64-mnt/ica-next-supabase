// app/layout.tsx
import { ReactNode } from 'react';
import { Metadata } from 'next'; 
import './globals.css'; // Importa gli stili globali qui

// *CRUCIALE per la responsività*
export const metadata: Metadata = {
  title: 'ICA Next Supabase App',
  description: 'Progetto Next.js con Supabase e i18n',
  viewport: 'width=device-width, initial-scale=1', 
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