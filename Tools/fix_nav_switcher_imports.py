from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
COMP = WEB / "components"

LANG = COMP / "LanguageSwitcher.tsx"

code = r"""'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import {locales} from '@/i18n/routing';

function replaceLocale(pathname: string, next: string) {
  // pathname es. "/it/news/articolo-1"
  const parts = pathname.split('/');
  // Index 0 = "", 1 = locale
  if (parts.length > 1) {
    parts[1] = next;
  }
  const replaced = parts.join('/');
  return replaced === '' ? '/' : replaced;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    router.replace(replaceLocale(pathname, next));
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

LANG.parent.mkdir(parents=True, exist_ok=True)
LANG.write_text(code, encoding="utf-8")
print(f"✓ {LANG}")
print("✅ LanguageSwitcher aggiornato: usa next/navigation al posto di next-intl/client.")
print("   Riavvia `npm run dev` e apri /it (o /en, /fr, /es, /de).")
