# Tools/fix_nav_link_imports.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
COMP = WEB / "components"
NAV = COMP / "Nav.tsx"

new_code = r"""'use client';

import Link from 'next/link';
import {useLocale, useTranslations} from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './nav.module.css';

export default function Nav() {
  const locale = useLocale();
  const t = useTranslations('nav');

  const items = [
    { key: 'home',    href: '' },
    { key: 'news',    href: '/news' },
    { key: 'articles',href: '/articles' },
    { key: 'about',   href: '/about' },
    { key: 'faq',     href: '/faq' },
    { key: 'glossary',href: '/glossary' },
    { key: 'contact', href: '/contact' }
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href={`/${locale}`} className={styles.brand}>ICA</Link>
        <ul className={styles.menu}>
          {items.map((it) => (
            <li key={it.key}>
              <Link href={`/${locale}${it.href}`}>{t(it.key)}</Link>
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

NAV.parent.mkdir(parents=True, exist_ok=True)
NAV.write_text(new_code, encoding="utf-8")
print(f"✓ {NAV}")
print("✅ Nav aggiornata: ora usa next/link e prefissa la locale negli URL.")
