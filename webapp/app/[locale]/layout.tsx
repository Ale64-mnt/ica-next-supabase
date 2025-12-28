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

export function generateStaticParams() {
  return [{ locale: 'it' }, { locale: 'en' }, { locale: 'fr' }, { locale: 'de' }, { locale: 'es' }];
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  setRequestLocale(locale);

  let messages: AbstractIntlMessages;
  try {
    messages = (await getMessages()) as AbstractIntlMessages;
  } catch {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Common' });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <a href="#main-content" className="skip-link">
        {t('skip_to_content')}
      </a>
      <Header locale={locale} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}