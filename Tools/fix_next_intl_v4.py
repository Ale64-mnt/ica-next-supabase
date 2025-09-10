# Tools/fix_next_intl_v4.py

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # .../ica-Next.js + Supabase
APP  = ROOT / "webapp"
I18N = APP / "i18n"
MSG  = APP / "messages"
LOCALE_DIR = APP / "app" / "[locale]"

I18N.mkdir(exist_ok=True)
LOCALE_DIR.mkdir(parents=True, exist_ok=True)
MSG.mkdir(exist_ok=True)

# 1) i18n/routing.ts
(APP / "i18n" / "routing.ts").write_text("""\
export const locales = ['it','en','fr','es','de'] as const;
export const defaultLocale = 'it';

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const
};
""", encoding="utf-8")

# 2) i18n/request.ts
(APP / "i18n" / "request.ts").write_text("""\
import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './routing';

export default getRequestConfig(async ({locale}) => {
  // Fallback nel caso arrivi una locale non supportata
  if (!locales.includes(locale as any)) locale = defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  return {messages};
});
""", encoding="utf-8")

# 3) middleware.ts (usa il routing)
(APP / "middleware.ts").write_text("""\
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

// App Router: intercetta tutto tranne asset/_next e file statici
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};
""", encoding="utf-8")

# 4) app/[locale]/layout.tsx – provider & messages
(LOCALE_DIR / "layout.tsx").write_text("""\
import '../globals.css';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getLocale} from 'next-intl/server';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'ICA',
  description: 'Institute for Conscious Action'
};

export default async function LocaleLayout({children}: {children: React.ReactNode}) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <Nav />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
""", encoding="utf-8")

print("✅ next-intl v4 configurato: i18n/routing.ts, i18n/request.ts, middleware.ts, app/[locale]/layout.tsx aggiornati.")
