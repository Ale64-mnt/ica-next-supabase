import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import type { Metadata } from 'next';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// Funzione per caricare i messaggi di traduzione
async function getMessages(locale: string) {
  try {
    // Carica i file di traduzione
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // Se il file della lingua non esiste, mostra 404
    notFound(); 
  }
}

// Metadata Globale
export const metadata: Metadata = {
  title: 'ICA Webapp - Sito Istituzionale Multilingua',
  description: 'Sito aziendale con standard WCAG e integrazione Supabase.',
};

export default async function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale}> {/* WCAG 5: Tag lang corretto */}
      <body style={{ margin: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* WCAG 2: Link "Salta al Contenuto" - Essential for keyboard navigation */}
          <a href="#main-content" className="skip-link">Salta al Contenuto Principale</a>
          
          {/* ✅ CORREZIONE: Passaggio della prop locale all'Header */}
          <Header locale={locale} />
          
          {/* id="main-content" è il target del link skip-link */}
          <main id="main-content" style={{ flexGrow: 1, padding: '2rem' }}>
            {children}
          </main>
          
          {/* ✅ CORREZIONE: Passaggio della prop locale al Footer */}
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
