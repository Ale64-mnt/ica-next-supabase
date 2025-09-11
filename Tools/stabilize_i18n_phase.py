# Tools/stabilize_i18n_phase.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # cartella progetto (…/ica-Next.js + Supabase)
APP  = ROOT / "webapp"
I18N = APP / "i18n"
COMP = APP / "components"

def write(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"✓ {p}")

# 1) next-intl.config.ts
write(APP / "next-intl.config.ts", r"""
import {defineConfig} from 'next-intl';

export default defineConfig({
  locales: ['it', 'en', 'fr', 'es', 'de'],
  defaultLocale: 'it',
  localePrefix: 'always'
});
""")

# 2) i18n/routing.ts
write(I18N / "routing.ts", r"""
export const locales = ['it', 'en', 'fr', 'es', 'de'] as const;
export const defaultLocale = 'it';

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const
};
""")

# 3) i18n/request.ts
write(I18N / "request.ts", r"""
// Helper per server components (re-export da next-intl/server)
export {getLocale, getMessages, getTranslations as getMessagesT} from 'next-intl/server';
""")

# 4) middleware.ts (matcher corretto)
write(APP / "middleware.ts", r"""
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // esclude asset/statici (._next, file con estensione)
  matcher: ['/((?!_next|.*\\..*).*)']
};
""")

# 5) app/[locale]/layout.tsx (provider + messages)
write(APP / "app" / "[locale]" / "layout.tsx", r"""
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from '@/i18n/request';
import '../globals.css';

export const metadata: Metadata = {
  title: 'ICA',
  description: 'Educazione finanziaria, digitale ed etica'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
""")

# 6) components/LanguageSwitcher.tsx (next/navigation, non next-intl/client)
write(COMP / "LanguageSwitcher.tsx", r"""
'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import {locales} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const router = useRouter();

  function changeLanguage(next: string) {
    const parts = pathname.split('/');
    // forza '/{locale}/...' sostituendo il primo segmento
    parts[1] = next;
    const target = parts.join('/') || '/';
    router.push(target);
  }

  return (
    <select value={locale} onChange={(e) => changeLanguage(e.target.value)}>
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
""")

# 7) components/Nav.tsx (next/link + prefisso locale sugli href)
write(COMP / "Nav.tsx", r"""
'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

const items = [
  {href: '/',        key: 'nav.home'},
  {href: '/news',    key: 'nav.news'},
  {href: '/articles',key: 'nav.articles'},
  {href: '/about',   key: 'nav.about'},
  {href: '/contact', key: 'nav.contact'}
];

export default function Nav() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <nav style={{display:'flex', gap:16, alignItems:'center', padding:'12px 0'}}>
      <div style={{display:'flex', gap:12}}>
        {items.map((it) => (
          <Link key={it.href} href={`/${locale}${it.href}`}>
            {t(it.key)}
          </Link>
        ))}
      </div>
      <div style={{marginLeft:'auto'}}>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
""")

print("\n✅ i18n stabilizzato. Riavvia `npm run dev` e testa /it, /en, /fr, /es, /de.")
