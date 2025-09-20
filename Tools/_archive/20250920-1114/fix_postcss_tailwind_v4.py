# tools/fix_postcss_tailwind_v4.py
# -*- coding: utf-8 -*-
"""
Aggiorna webapp/postcss.config.js per Tailwind v4:
usa il plugin '@tailwindcss/postcss' invece di 'tailwindcss' diretto.
Crea il file se manca.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
POSTCSS = WEBAPP / "postcss.config.js"

CONTENT = """module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
"""

def main():
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] Cartella webapp non trovata: {WEBAPP}")
    POSTCSS.parent.mkdir(parents=True, exist_ok=True)
    POSTCSS.write_text(CONTENT, encoding="utf-8", newline="\n")
    print(f"[OK] postcss.config.js aggiornato per Tailwind v4 → {POSTCSS.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
