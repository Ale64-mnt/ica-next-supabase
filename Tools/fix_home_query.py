from pathlib import Path
import re

REPO = Path(__file__).resolve().parents[1]
PAGE = REPO / "webapp" / "app" / "[locale]" / "page.tsx"
CARD = REPO / "webapp" / "components" / "ArticleCard.tsx"
PUBLIC = REPO / "webapp" / "public"

def patch_page():
    src = PAGE.read_text(encoding="utf-8")

    # 1) sostituisci la SELECT: campi realmente esistenti + order per id
    src = re.sub(
        r"""\.from\("news"\)\s*\.\s*select\([^\)]*\)\s*\.order\([^\)]*\)\s*\.limit\(\d+\)\s*;""",
        """.from("news")
    .select<"id, slug, title, summary, lang">("id, slug, title, summary, lang")
    .order("id", { ascending: False })
    .limit(6);""",
        src,
        flags=re.DOTALL,
    )

    # 2) mappatura: category/coverUrl -> null (non esistono in tabella)
    src = re.sub(
        r"""map\(\(n\)\s*=>\s*\(\{\s*href:[^\}]*\}\)\s*\)""",
        """map((n) => ({
        href: `/${locale}/news/${(n as any).slug}`,
        title: ((n as any).title) ?? "Senza titolo",
        summary: ((n as any).summary) ?? null,
        category: null,
        coverUrl: null,
      }))""",
        src,
        flags=re.DOTALL,
    )

    PAGE.write_text(src, encoding="utf-8")
    print(f"[OK] Patch applicata a: {PAGE.relative_to(REPO)}")

def patch_article_card():
    if not CARD.exists():
        print("[SKIP] ArticleCard.tsx non trovato (ok se non lo usiamo).")
        return
    src = CARD.read_text(encoding="utf-8")

    # Rende opzionali category/coverUrl e li tipizza come string|null
    src2 = src
    src2 = re.sub(r"""category:\s*string;""", "category?: string | null;", src2)
    src2 = re.sub(r"""coverUrl:\s*string;""", "coverUrl?: string | null;", src2)

    if src2 != src:
        CARD.write_text(src2, encoding="utf-8")
        print(f"[OK] Patch props opzionali in: {CARD.relative_to(REPO)}")
    else:
        print("[OK] ArticleCard già compatibile.")

def ensure_favicon():
    ico = PUBLIC / "favicon.ico"
    if ico.exists():
        print("[OK] favicon.ico già presente.")
        return
    logo = PUBLIC / "logo.png"
    if logo.exists():
        # copia “finta” come .ico: sufficiente per evitare il 404
        ico.write_bytes(logo.read_bytes())
        print("[OK] favicon.ico creato (copia di logo.png).")
    else:
        print("[SKIP] Nessun logo.png da copiare come favicon.")

if __name__ == "__main__":
    if not PAGE.exists():
        raise SystemExit(f"[ERR] File non trovato: {PAGE}")
    patch_page()
    patch_article_card()
    ensure_favicon()
    print("[DONE] Fix Home query + compatibilità ArticleCard + favicon")
