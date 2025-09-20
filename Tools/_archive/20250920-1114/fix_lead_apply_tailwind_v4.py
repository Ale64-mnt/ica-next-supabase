from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
globals_css = root / "webapp" / "app" / "globals.css"
news_page = root / "webapp" / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"

# 1) rimuovi md:text-xl da @apply (.lead)
if globals_css.exists():
    css = globals_css.read_text(encoding="utf-8")
    # normalizza: togli md:text-xl solo dentro il blocco .lead { ... }
    def _fix_block(m):
        block = m.group(0)
        block = block.replace("md:text-xl", "").replace("  ", " ")
        return block
    css_fixed = re.sub(r"\.lead\s*\{[^}]+\}", _fix_block, css, flags=re.S)
    if css_fixed != css:
        globals_css.write_text(css_fixed, encoding="utf-8", newline="\n")
        print(f"[UP] {globals_css.relative_to(root)} – rimosso 'md:text-xl' da @apply")
    else:
        print(f"[OK] {globals_css.relative_to(root)} – nessuna modifica necessaria")
else:
    print("[WARN] globals.css non trovato")

# 2) aggiungi 'md:text-xl' direttamente sugli elementi <p className="lead">
if news_page.exists():
    tsx = news_page.read_text(encoding="utf-8")
    tsx_fixed = tsx.replace('className="lead"', 'className="lead md:text-xl"')
    if tsx_fixed != tsx:
        news_page.write_text(tsx_fixed, encoding="utf-8", newline="\n")
        print(f"[UP] {news_page.relative_to(root)} – aggiunto 'md:text-xl' a <p className=\"lead\">")
    else:
        print(f"[OK] {news_page.relative_to(root)} – già aggiornato")
else:
    print("[WARN] page.tsx news non trovato")

print("[DONE] Fix Tailwind v4 @apply varianti responsive.")
