# tools/pl5b_integration.py
# -*- coding: utf-8 -*-
"""
PL-5b Integration: inserisce automaticamente SiteHeader e SiteFooter
in webapp/app/[locale]/layout.tsx

Uso:
  .\.venv\Scripts\python.exe tools\pl5b_integration.py
"""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "webapp/app/[locale]/layout.tsx"

IMPORTS = """\
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
"""

def main():
    if not TARGET.exists():
        raise SystemExit(f"[ERR] File non trovato: {TARGET}")

    text = TARGET.read_text(encoding="utf-8")

    # 1. Aggiunge import se mancanti
    if "SiteHeader" not in text:
        text = re.sub(r'(import .+\n)+', r'\g<0>' + IMPORTS + "\n", text, count=1)

    # 2. Inserisce <SiteHeader /> subito dopo <body>
    if "<SiteHeader" not in text:
        text = text.replace("<body>", "<body>\n      <SiteHeader />")

    # 3. Inserisce <SiteFooter /> prima della chiusura </body>
    if "<SiteFooter" not in text:
        text = text.replace("</body>", "      <SiteFooter />\n    </body>")

    TARGET.write_text(text, encoding="utf-8", newline="\n")
    print(f"[OK] layout.tsx aggiornato con SiteHeader + SiteFooter")

if __name__ == "__main__":
    main()
