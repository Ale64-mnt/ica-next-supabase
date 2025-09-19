# -*- coding: utf-8 -*-
"""
pl6b_analytics_bootstrap.py
Crea/patcha componenti per Analytics (GA4 base).
- Crea components/Analytics.tsx
- Patcha app/[locale]/layout.tsx includendo <Analytics />
- Assicura NEXT_PUBLIC_GA_ID in .env.local
Idempotente, sintassi testata.
"""
from __future__ import annotations
from pathlib import Path
import sys, re

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
CMP = WEBAPP / "components" / "Analytics.tsx"
LAYOUT = WEBAPP / "app" / "[locale]" / "layout.tsx"
ENV = WEBAPP / ".env.local"

CMP_TSX = """'use client';

import Script from 'next/script';

export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
"""

def ensure_component():
    CMP.parent.mkdir(parents=True, exist_ok=True)
    if not CMP.exists():
        CMP.write_text(CMP_TSX, encoding="utf-8")
        return f"CREATE {CMP.relative_to(ROOT)}"
    return f"EXIST {CMP.relative_to(ROOT)}"

def ensure_env():
    if ENV.exists():
        lines = ENV.read_text(encoding="utf-8").splitlines()
    else:
        lines = []
    keys = {ln.split("=",1)[0].strip() for ln in lines if "=" in ln}
    if "NEXT_PUBLIC_GA_ID" not in keys:
        lines.append("NEXT_PUBLIC_GA_ID=G-XXXXXXX")
        ENV.write_text("\n".join(lines) + "\n", encoding="utf-8")
        return "ENV+ NEXT_PUBLIC_GA_ID"
    return "ENV OK"

def patch_layout():
    if not LAYOUT.exists():
        return [f"MISS {LAYOUT.relative_to(ROOT)}"]
    txt = LAYOUT.read_text(encoding="utf-8")
    logs = []
    if "import Analytics" not in txt:
        txt = txt.replace(
            "import SiteFooter from '@/components/SiteFooter';",
            "import SiteFooter from '@/components/SiteFooter';\nimport Analytics from '@/components/Analytics';"
        )
        logs.append("ADD import Analytics")
    if "<Analytics" not in txt:
        # inserisci prima della chiusura </body> oppure </html>
        txt = re.sub(r"(\</body\>|\</html\>)", "  <Analytics />\n\\1", txt, count=1)
        logs.append("ADD <Analytics />")
    if logs:
        LAYOUT.write_text(txt, encoding="utf-8")
    return logs if logs else ["OK layout"]

def main():
    changes = []
    changes.append(ensure_component())
    changes.append(ensure_env())
    changes.extend(patch_layout())
    print("=== pl6b_analytics_bootstrap ===")
    for c in changes:
        if isinstance(c, str):
            print(c)
        else:
            print("\n".join(c))
    any_change = any(
        (isinstance(c, str) and c.startswith(("CREATE","ENV+","ADD")))
        or (isinstance(c, list) and any(s.startswith(("ADD")) for s in c))
        for c in changes
    )
    return 1 if any_change else 0

if __name__ == "__main__":
    sys.exit(main())
