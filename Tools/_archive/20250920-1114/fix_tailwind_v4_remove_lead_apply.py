# tools/fix_tailwind_v4_remove_lead_apply.py
# Rimuove la regola .lead con @apply da globals.css (Tailwind v4) e
# mette le classi direttamente nel JSX (News e Blog).

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
GLOBALS = WEBAPP / "app" / "globals.css"

NEWS_PAGE = WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"
BLOG_PAGE = WEBAPP / "app" / "[locale]" / "blog" / "[slug]" / "page.tsx"

def strip_lead_block(css: str) -> str:
    # elimina intero blocco .lead { ... }
    return re.sub(r"\.lead\s*\{[^}]*\}", "", css, flags=re.S)

def update_tsx(tsx: str) -> str:
    # sostituisce <p className="lead"> con classi inline sicure per v4
    tsx = tsx.replace(
        'className="lead md:text-xl"',
        'className="text-lg md:text-xl text-gray-700 leading-relaxed"'
    )
    tsx = tsx.replace(
        'className="lead"',
        'className="text-lg md:text-xl text-gray-700 leading-relaxed"'
    )
    return tsx

def main():
    # 1) globals.css
    if GLOBALS.exists():
        css = GLOBALS.read_text(encoding="utf-8")
        new_css = strip_lead_block(css)
        # pulizia spazi vuoti multipli
        new_css = re.sub(r"\n{3,}", "\n\n", new_css)
        if new_css != css:
            GLOBALS.write_text(new_css, encoding="utf-8", newline="\n")
            print(f"[UP] {GLOBALS.relative_to(ROOT)} – rimossa .lead con @apply")
        else:
            print(f"[OK] {GLOBALS.relative_to(ROOT)} – nessun blocco .lead da rimuovere")
    else:
        print("[WARN] globals.css non trovato")

    # 2) page News
    if NEWS_PAGE.exists():
        tsx = NEWS_PAGE.read_text(encoding="utf-8")
        new_tsx = update_tsx(tsx)
        if new_tsx != tsx:
            NEWS_PAGE.write_text(new_tsx, encoding="utf-8", newline="\n")
            print(f"[UP] {NEWS_PAGE.relative_to(ROOT)} – classi inline per lead")
        else:
            print(f"[OK] {NEWS_PAGE.relative_to(ROOT)} – già aggiornato")
    else:
        print("[WARN] pagina news non trovata")

    # 3) page Blog (se presente)
    if BLOG_PAGE.exists():
        tsx = BLOG_PAGE.read_text(encoding="utf-8")
        new_tsx = update_tsx(tsx)
        if new_tsx != tsx:
            BLOG_PAGE.write_text(new_tsx, encoding="utf-8", newline="\n")
            print(f"[UP] {BLOG_PAGE.relative_to(ROOT)} – classi inline per lead")
        else:
            print(f"[OK] {BLOG_PAGE.relative_to(ROOT)} – già aggiornato")
    else:
        print("[INFO] pagina blog non trovata (ok)")

    print("[DONE] Tailwind v4: rimosso @apply e spostato le classi nel JSX.")

if __name__ == "__main__":
    main()
