import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Header } from '@/components/navigation/Header';
import Footer from '@/components/SiteFooter';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          {/* UNICO HEADER - NESSUN DOPPIONE */}
          <Header locale={locale} />
          
          <main id="main-content">
            {children}
          </main>
          
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
