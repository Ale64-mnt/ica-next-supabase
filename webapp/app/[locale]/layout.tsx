import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ReactNode } from 'react';
import '../globals.css'; // ✅ AGGIUNGI QUESTA RIGA

interface LocaleLayoutProps {
  children: ReactNode;
  params: {
    locale: string;
  };
}

const locales = ['en', 'it', 'de', 'es', 'fr'];

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound(); 
  }
}

export default async function LocaleLayout({ 
  children, 
  params: { locale } 
}: LocaleLayoutProps) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <head>
        <title>ICA Webapp</title>
      </head>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Link accessibilità */}
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:bg-gray-800 focus:text-white focus:rounded-br-lg">
            Salta al Contenuto Principale
          </a>
          
          <SiteHeader locale={locale} />
          
          <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}