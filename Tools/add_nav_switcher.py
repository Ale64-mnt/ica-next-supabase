from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]  # cartella progetto (…\ica-Next.js + Supabase)
WEB = ROOT / "webapp"
COMP = WEB / "components"
APP = WEB / "app"
LOCALE_LAYOUT = APP / "[locale]" / "layout.tsx"
GLOBAL_CSS = APP / "globals.css"

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"✓ {path}")

def upsert_nav():
    content = r"""'use client';

import Link from 'next-intl/link';
import {useLocale} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './nav.module.css';

const items = [
  {href: '/',         label: 'nav.home'},
  {href: '/news',     label: 'nav.news'},
  {href: '/articles', label: 'nav.articles'},
  {href: '/about',    label: 'nav.about'},
  {href: '/faq',      label: 'nav.faq'},
  {href: '/glossary', label: 'nav.glossary'},
  {href: '/contact',  label: 'nav.contact'}
];

export default function Nav() {
  const locale = useLocale();

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/" locale={locale} className={styles.brand}>
          ICA
        </Link>
        <ul className={styles.menu}>
          {items.map((it) => (
            <li key={it.href}>
              <Link href={it.href} locale={locale} prefetch={false} className={styles.link}>
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.right}>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
"""
    write(COMP / "Nav.tsx", content)

    css = r""".nav{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.75rem 0}
.left{display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap}
.brand{font-weight:700;text-decoration:none}
.menu{display:flex;align-items:center;gap:.75rem;list-style:none;margin:0;padding:0;flex-wrap:wrap}
.link{text-decoration:none;opacity:.9}
.link:hover{opacity:1;text-decoration:underline}
.right{display:flex;align-items:center;gap:.5rem}
"""
    write(COMP / "nav.module.css", css)

def upsert_language_switcher():
    content = r"""'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next-intl/client';
import {locales} from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    // preserva la stessa route, cambia solo lingua
    router.replace(pathname, {locale: next});
  }

  return (
    <label style={{display:'inline-flex',alignItems:'center',gap:'.5rem'}}>
      <span style={{opacity:.7}}>{t('language')}</span>
      <select value={locale} onChange={onChange}>
        {locales.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </label>
  );
}
"""
    write(COMP / "LanguageSwitcher.tsx", content)

def upsert_layout():
    content = r"""import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from '@/i18n/request';
import Nav from '@/components/Nav';

export const metadata = {
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
        <header className="container">
          <Nav />
        </header>

        <main className="container">
          {children}
        </main>

        <footer className="container" style={{marginTop:'3rem',opacity:.7}}>
          © {new Date().getFullYear()} ICA
        </footer>

        <NextIntlClientProvider messages={messages} />
      </body>
    </html>
  );
}
"""
    write(LOCALE_LAYOUT, content)

def ensure_global_css():
    css = GLOBAL_CSS.read_text(encoding="utf-8") if GLOBAL_CSS.exists() else ""
    # aggiungi container solo se manca
    if "/* ica:container */" not in css:
        css += r"""

/* ica:container */
.container{max-width:1100px;margin:0 auto;padding:0 16px}
"""
        write(GLOBAL_CSS, css)
    else:
        print(f"• {GLOBAL_CSS} già aggiornato")

def main():
    upsert_nav()
    upsert_language_switcher()
    upsert_layout()
    ensure_global_css()
    print("\n✅ Navbar + LanguageSwitcher installati. Riavvia `npm run dev` e apri /it (o /en, /fr, /es, /de).")

if __name__ == "__main__":
    main()
