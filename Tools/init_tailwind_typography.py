# tools/init_tailwind_typography.py
# -*- coding: utf-8 -*-
"""
Inizializza/aggiorna Tailwind in webapp/ con plugin @tailwindcss/typography.
- Crea webapp/tailwind.config.ts se manca (con plugin tipografia abilitato)
- Crea webapp/postcss.config.js se manca
- Crea/integra webapp/app/globals.css con direttive @tailwind e stile .prose a
- Non tocca nulla fuori da webapp/
"""

from __future__ import annotations
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
TAILWIND = WEBAPP / "tailwind.config.ts"
POSTCSS = WEBAPP / "postcss.config.js"
GLOBAL_CSS = WEBAPP / "app" / "globals.css"

TAILWIND_TS = """import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {}
  },
  plugins: [typography]
};
export default config;
"""

POSTCSS_JS = """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"""

PROSE_SNIPPET = """
/* Tipografia personalizzata per i contenuti */
.prose a {
  @apply text-blue-600 underline hover:text-blue-800;
}
"""

def ensure_dir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)

def upsert_tailwind_ts():
    if not TAILWIND.exists():
        ensure_dir(TAILWIND)
        TAILWIND.write_text(TAILWIND_TS, encoding="utf-8", newline="\n")
        print(f"[NEW] {TAILWIND.relative_to(ROOT)} creato")
    else:
        txt = TAILWIND.read_text(encoding="utf-8")
        changed = False
        if 'import typography from "@tailwindcss/typography";' not in txt:
            txt = 'import typography from "@tailwindcss/typography";\n' + txt
            changed = True
        if "plugins:" in txt and "typography" not in txt:
            txt = txt.replace("plugins: [", "plugins: [typography, ")
            changed = True
        elif "plugins:" not in txt:
            # aggiungi blocco plugins prima dell'export default config;
            txt = txt.replace("};\nexport default config;", "  plugins: [typography]\n};\nexport default config;")
            changed = True
        if changed:
            TAILWIND.write_text(txt, encoding="utf-8", newline="\n")
            print(f"[UP]  {TAILWIND.relative_to(ROOT)} aggiornato")
        else:
            print(f"[OK]  {TAILWIND.relative_to(ROOT)} già configurato")

def ensure_postcss():
    if not POSTCSS.exists():
        ensure_dir(POSTCSS)
        POSTCSS.write_text(POSTCSS_JS, encoding="utf-8", newline="\n")
        print(f"[NEW] {POSTCSS.relative_to(ROOT)} creato")
    else:
        print(f"[OK]  {POSTCSS.relative_to(ROOT)} già presente")

def ensure_globals():
    ensure_dir(GLOBAL_CSS)
    if not GLOBAL_CSS.exists():
        GLOBAL_CSS.write_text("@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" + PROSE_SNIPPET, encoding="utf-8", newline="\n")
        print(f"[NEW] {GLOBAL_CSS.relative_to(ROOT)} creato con direttive Tailwind")
        return

    txt = GLOBAL_CSS.read_text(encoding="utf-8")
    changed = False
    if "@tailwind base;" not in txt or "@tailwind components;" not in txt or "@tailwind utilities;" not in txt:
        # Prepend direttive se mancanti
        lines = []
        if "@tailwind base;" not in txt:
            lines.append("@tailwind base;")
        if "@tailwind components;" not in txt:
            lines.append("@tailwind components;")
        if "@tailwind utilities;" not in txt:
            lines.append("@tailwind utilities;")
        txt = "\n".join(lines) + "\n" + txt
        changed = True
    if ".prose a" not in txt:
        txt = txt.rstrip() + "\n" + PROSE_SNIPPET
        changed = True

    if changed:
        GLOBAL_CSS.write_text(txt, encoding="utf-8", newline="\n")
        print(f"[UP]  {GLOBAL_CSS.relative_to(ROOT)} aggiornato")
    else:
        print(f"[OK]  {GLOBAL_CSS.relative_to(ROOT)} già configurato")

def main():
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] Cartella webapp non trovata: {WEBAPP}")
    upsert_tailwind_ts()
    ensure_postcss()
    ensure_globals()
    print("[DONE] Tailwind + Typography inizializzati/aggiornati in webapp/")

if __name__ == "__main__":
    main()
