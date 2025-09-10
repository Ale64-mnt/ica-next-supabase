# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "webapp"

def write(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
    print(f"✓ {p}")

# 1) next-intl.config.ts (già presente, ma lo riscriviamo per sicurezza)
write(
    ROOT / "next-intl.config.ts",
    """
import {defineConfig} from 'next-intl';

export default defineConfig({
  locales: ['it','en','fr','es','de'],
  defaultLocale: 'it',
  localePrefix: 'always'
});
""".strip()
)

# 2) i18n/routing.ts (mappa lingue)
write(
    ROOT / "i18n" / "routing.ts",
    """
export const locales = ['it','en','fr','es','de'] as const;
export const defaultLocale = 'it';

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const
};
""".strip()
)

# 3) i18n/request.ts (QUI si risolve l'errore: deve RESTITUIRE un locale)
write(
    ROOT / "i18n" / "request.ts",
    """
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = requestLocale ?? routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
""".strip()
)

# 4) middleware.ts (usa createMiddleware + routing)
write(
    ROOT / "middleware.ts",
    """
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // intercetta tutto eccetto asset/statici
  matcher: ['/(?!_next|.*\\..*).*']
};
""".strip()
)

# 5) app/[locale]/layout.tsx: setRequestLocale + NextIntlClientProvider
write(
    ROOT / "app" / "[locale]" / "layout.tsx",
    """
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
""".strip()
)

# 6) app/[locale]/page.tsx: esempio semplice (usaTranslations)
write(
    ROOT / "app" / "[locale]" / "page.tsx",
    """
'use client';
import {useTranslations} from 'next-intl';

export default function Home() {
  const t = useTranslations('home');
  return (
    <main style={{padding: '2rem'}}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
    </main>
  );
}
""".strip()
)

# 7) messaggi base per tutte le lingue (garantiamo che le chiavi esistano)
messages_dir = ROOT / "messages"
messages_dir.mkdir(parents=True, exist_ok=True)
base_msg = {"home": {"title": "Benvenuto 👋", "intro": "Skeleton Next.js + Supabase + i18n pronto."}}
for code, title in [
    ("it","Benvenuto 👋"),
    ("en","Welcome 👋"),
    ("fr","Bienvenue 👋"),
    ("es","Bienvenido 👋"),
    ("de","Willkommen 👋"),
]:
    data = {
        "home": {
            "title": title,
            "intro": "Skeleton Next.js + Supabase + i18n ready." if code != "it"
                     else "Skeleton Next.js + Supabase + i18n pronto."
        }
    }
    f = messages_dir / f"{code}.json"
    if f.exists():
        try:
            current = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            current = {}
        # merge semplice
        current.setdefault("home", {}).setdefault("title", data["home"]["title"])
        current["home"].setdefault("intro", data["home"]["intro"])
        f.write_text(json.dumps(current, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        f.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ {f}")

print("\n✅ next-intl v4: request locale + provider configurati.")
print("   Riavvia `npm run dev` e apri http://localhost:3000/it (o /en, /fr, /es, /de)")
