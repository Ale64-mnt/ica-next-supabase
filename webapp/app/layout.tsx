// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import CookieBotScript from '@/components/CookieBotScript';
import './globals.css';

// Font ottimizzato - display: 'swap' previene FOIT (Flash of Invisible Text)
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // remove preload: true se causa problemi, Next.js gestisce automaticamente
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
    // Aggiungi configurazione per altri crawler se necessario
    googleBot: {
      index: false,
      follow: false,
      'max-image-preview': 'none',
    },
  },
  // Metadata aggiuntivi per migliorare SEO e social sharing
  keywords: ['compliance', 'finanza', 'educazione finanziaria'],
  authors: [{ name: 'Urban Space Memory' }],
  creator: 'Urban Space Memory',
  publisher: 'Urban Space Memory',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permetti zoom per accessibilità
  themeColor: '#ffffff',
  colorScheme: 'light',
  // userScalable: true è il default, non serve specificarlo
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* 
          IMPORTANTE: CookieBotScript DEVE essere un Client Component.
          Verifica che il file components/CookieBotScript.tsx inizi con 'use client';
        */}
        <CookieBotScript />
        
        {/* 
          Meta tag ottimizzati - compatti ma separati per chiarezza.
          IMPORTANTE: Next.js gestisce automaticamente il viewport,
          questo meta tag potrebbe essere ridondante ma è un fallback.
        */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* 
          Favicon moderno con fallback. Assicurati che i file esistano in /public/
          Per ottimizzazione, considera di generare favicon con: https://realfavicongenerator.net/
        */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 
          Preconnect per domini critici - migliora performance.
          Limitati ai domini essenziali per non sprecare risorse browser.
        */}
        <link rel="preconnect" href="https://consent.cookiebot.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://twwgfrbcndouazujgcma.supabase.co" crossOrigin="anonymous" />
        
        {/* 
          DNS prefetch opzionale per altri domini usati meno frequentemente.
          Esempio se usi altri servizi esterni:
          <link rel="dns-prefetch" href="https://smtp-relay.brevo.com" />
        */}
        
        {/* 
          🔥 CRITICO: Rimuovi qualsiasi preload del CSS di layout.
          Next.js gestisce automaticamente il caricamento del CSS.
          I preload manuali spesso causano l'errore "preloaded but not used".
        */}
        
        {/* 
          Per eventuali font esterni (non Inter di Google Fonts), 
          potresti aver bisogno di preload qui.
          Per Inter, Next.js gestisce tutto automaticamente.
        */}
      </head>
      
      <body className={inter.className}>
        {/* 
          Skip link per accessibilità - essenziale per utenti keyboard.
          Assicurati che il target #main-content esista nelle tue pagine.
          Gli stili per .sr-only dovrebbero essere in globals.css.
        */}
        <a href="#main-content" className="sr-only">
          Salta al contenuto principale
        </a>
        
        {children}
        
        {/* 
          NOTA CRITICA: 
          - NON aggiungere <script> o <style> tags qui nel Server Component.
          - Eventuali script devono essere in Client Components separati.
          - Eventuali stili globali vanno in globals.css.
          - Per stili JS-in-JSX, usa 'use client' e crea componenti separati.
        */}
      </body>
    </html>
  );
}