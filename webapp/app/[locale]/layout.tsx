// app/[locale]/layout.tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { Header } from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// (opzionale) pre-build locali
export function generateStaticParams() {
  return [{ locale: 'it' }, { locale: 'en' }, { locale: 'fr' }, { locale: 'de' }, { locale: 'es' }];
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  // informa next-intl della locale (SSR-safe)
  setRequestLocale(locale);

  // carica messaggi tipizzati per NextIntlClientProvider
  let messages: AbstractIntlMessages;
  try {
    messages = (await getMessages()) as AbstractIntlMessages;
  } catch {
    notFound();
  }

  // testo server-side per evitare mismatch di idratazione
  const t = await getTranslations({ locale, namespace: 'Common' });

  // ⚠️ niente <html>/<body> qui: sono nel root app/layout.tsx
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <a href="#main-content" className="skip-link">
        {t('skip_to_content')}
      </a>

      {/* ✅ HEADER FIX: Aggiunto stile inline per larghezza garantita */}
      <Header 
        locale={locale} 
        style={{ width: '100vw', maxWidth: '100%', left: 0, right: 0 }}
      />

      <main id="main-content" className="min-h-screen">
        {/* ✅ CONTAINER FIX: Rimosso container che limitava la larghezza */}
        {children}
      </main>

      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}