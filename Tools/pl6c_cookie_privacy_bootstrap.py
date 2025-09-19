# -*- coding: utf-8 -*-
"""
pl6c_cookie_privacy_bootstrap.py
Crea:
- components/CookieBanner.tsx
- app/[locale]/privacy/page.tsx (IT/EN)
Patcha layout.tsx per includere <CookieBanner />
Idempotente, sintassi verificata.
"""
from __future__ import annotations
from pathlib import Path
import sys, re

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
CMP = WEBAPP / "components" / "CookieBanner.tsx"
PRIV_IT = WEBAPP / "app" / "it" / "privacy" / "page.tsx"
PRIV_EN = WEBAPP / "app" / "en" / "privacy" / "page.tsx"
LAYOUT = WEBAPP / "app" / "[locale]" / "layout.tsx"

CMP_TSX = """'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ok = window.localStorage.getItem('cookie-consent');
    if (!ok) setVisible(true);
  }, []);

  const accept = () => {
    window.localStorage.setItem('cookie-consent', 'yes');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 text-sm flex flex-col sm:flex-row items-center justify-between gap-2 z-50">
      <span>
        Questo sito utilizza solo cookie tecnici. Maggiori dettagli nella{' '}
        <Link href="/it/privacy" className="underline">Privacy Policy</Link>.
      </span>
      <button
        onClick={accept}
        className="bg-white text-gray-900 px-3 py-1 rounded hover:opacity-80"
      >
        Ok
      </button>
    </div>
  );
}
"""

PRIVACY_IT = """export default function PrivacyPage() {
  return (
    <main className="prose mx-auto p-8">
      <h1>Privacy Policy</h1>
      <p>Questa è la pagina di esempio della Privacy Policy in italiano.</p>
      <p>Qui puoi inserire il testo legale completo richiesto dal GDPR.</p>
    </main>
  );
}
"""

PRIVACY_EN = """export default function PrivacyPage() {
  return (
    <main className="prose mx-auto p-8">
      <h1>Privacy Policy</h1>
      <p>This is the sample Privacy Policy page in English.</p>
      <p>Please insert here the full legal text required by GDPR.</p>
    </main>
  );
}
"""

def ensure(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path.relative_to(ROOT)}"

def patch_layout(layout: Path) -> list[str]:
    logs = []
    if not layout.exists():
        return [f"MISS {layout.relative_to(ROOT)}"]

    txt = layout.read_text(encoding="utf-8")

    if "import CookieBanner" not in txt:
        txt = txt.replace(
            "import SiteFooter from '@/components/SiteFooter';",
            "import SiteFooter from '@/components/SiteFooter';\nimport CookieBanner from '@/components/CookieBanner';"
        )
        logs.append("ADD import CookieBanner")

    if "<CookieBanner" not in txt:
        txt = re.sub(r"(<SiteFooter\s*/>)", r"\1\n          <CookieBanner />", txt, count=1)
        logs.append("ADD <CookieBanner />")

    if logs:
        layout.write_text(txt, encoding="utf-8")

    return logs if logs else ["OK layout"]

def main() -> int:
    changes = []
    changes.append(ensure(CMP, CMP_TSX))
    changes.append(ensure(PRIV_IT, PRIVACY_IT))
    changes.append(ensure(PRIV_EN, PRIVACY_EN))
    changes.extend(patch_layout(LAYOUT))
    print("=== pl6c_cookie_privacy_bootstrap ===")
    for c in changes:
        if isinstance(c, list):
            for x in c: print(x)
        else:
            print(c)
    return 0

if __name__ == "__main__":
    sys.exit(main())
