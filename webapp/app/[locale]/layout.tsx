import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import '../globals.css';

export const metadata: Metadata = {
  title: 'ICA',
  description: 'Istituto per la Consapevolezza'
};

export function generateStaticParams() {
  return [{locale: 'it'}, {locale: 'en'}, {locale: 'fr'}, {locale: 'es'}, {locale: 'de'}];
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}