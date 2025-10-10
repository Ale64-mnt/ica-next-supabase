// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { Header } from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // Carica i messaggi SUL SERVER per evitare mismatch
  let messages: Record<string, any>;
  try {
    messages = await getMessages();
  } catch {
    // Se la locale non è supportata, 404
    notFound();
  }

  // Prendi la traduzione dello "skip link" sul server
  const t = await getTranslations({ locale, namespace: 'Common' }); // usa il tuo namespace

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Skip link tradotto server-side per evitare hydration mismatch */}
          <a href="#main-content" className="skip-link" suppressHydrationWarning>
  {t('skip_to_content')}
</a>

          <Header locale={locale} />

          <main id="main-content" className="min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}