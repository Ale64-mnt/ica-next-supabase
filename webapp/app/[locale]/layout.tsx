// app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {locales} from '@/i18n/routing'; // usa alias @ (già configurato)
import SiteHeader from "@/components/SiteHeader.tsx"
import SiteFooter from "@/components/SiteFooter.tsx"


/** Pre-render di /it, /en, /fr, /es, /de */
export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: ReactNode;
  params: {locale: string};
}) {
  // imposta la locale nel runtime next-intl (v4)
  setRequestLocale(locale);

  // se la locale non è supportata → 404
  if (!locales.includes(locale as any)) notFound();

  // carica i messaggi della lingua
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
      <SiteHeader />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
            <SiteFooter />
    </body>
    </html>
  );
}
