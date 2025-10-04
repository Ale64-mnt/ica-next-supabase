import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/SiteFooter';
import { ReactNode } from 'react';

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* AGGIUNGI IL FONT INTER */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ 
        margin: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        lineHeight: '1.5',
        fontFamily: 'Inter, system-ui, sans-serif' // APPLICA IL FONT
      }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[10000] focus:p-4 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-br-lg"
          >
            Salta al contenuto principale
          </a>
          
          <Header locale={locale} />
          
          <main 
            id="main-content" 
            tabIndex={-1}
            style={{ 
              flexGrow: 1, 
              padding: '2rem',
              outline: 'none'
            }}
          >
            {children}
          </main>
          
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}