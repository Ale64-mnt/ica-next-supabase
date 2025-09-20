# tools/pl5b_verify_phase.py
from __future__ import annotations
from pathlib import Path
import re, json, sys

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"

FILES = {
    "layout": WEBAPP / "app" / "[locale]" / "layout.tsx",
    "home": WEBAPP / "app" / "[locale]" / "page.tsx",
    "news_slug": WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx",
    "editorial_layout": WEBAPP / "components" / "EditorialLayout.tsx",
    "header": WEBAPP / "components" / "SiteHeader.tsx",
    "footer": WEBAPP / "components" / "SiteFooter.tsx",
    "article_card": WEBAPP / "components" / "ArticleCard.tsx",
    "logo": WEBAPP / "public" / "logo.png",
    "next_config": WEBAPP / "next.config.mjs",
    "i18n_it": WEBAPP / "messages" / "it.json",
    "i18n_en": WEBAPP / "messages" / "en.json",
}

REQUIRED_I18N_KEYS = {
    "it": {
        "home": ["title", "intro"],
        "news": ["empty"],
        "nav":  ["home", "news"],
    },
    "en": {
        "home": ["title", "intro"],
        "news": ["empty"],
        "nav":  ["home", "news"],
    },
}

def ok(msg):   print(f"[OK]  {msg}")
def warn(msg): print(f"[WARN]{msg}")
def err(msg):  print(f"[ERR] {msg}")

def must_exist(key: str) -> bool:
    p = FILES[key]
    if p.exists():
        ok(f"Presente: {p.relative_to(ROOT)}")
        return True
    err(f"Manca: {p.relative_to(ROOT)}")
    return False

def read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="ignore")

def has(pattern: str, text: str, flags=0) -> bool:
    return re.search(pattern, text, flags) is not None

def check_editorial_layout() -> bool:
    p = FILES["editorial_layout"]
    if not p.exists():
        warn("EditorialLayout.tsx non trovato (ok se non usato).")
        return True
    s = read(p)
    bad = []
    if has(r"SiteHeader", s):
        bad.append("import/render SiteHeader in EditorialLayout")
    if has(r"SiteFooter", s):
        bad.append("import/render SiteFooter in EditorialLayout")
    if bad:
        err("EditorialLayout contiene Header/Footer (crea doppioni). Rimuovere.")
        return False
    ok("EditorialLayout pulito (nessun Header/Footer dentro).")
    return True

def check_layout_locale() -> bool:
    p = FILES["layout"]
    if not p.exists():
        err("layout.tsx mancante.")
        return False
    s = read(p)
    req = [
        (r'from\s+"@/components/SiteHeader"', "import SiteHeader"),
        (r'from\s+"@/components/SiteFooter"', "import SiteFooter"),
        (r"<NextIntlClientProvider", "NextIntlClientProvider presente"),
        (r"<main[^>]*>[\s\S]*\{children\}[\s\S]*</main>", "<main>{children}</main> wrapper"),
    ]
    ok_all = True
    for pat, label in req:
        if has(pat, s):
            ok(f"layout.tsx: {label}")
        else:
            err(f"layout.tsx: manca {label}")
            ok_all = False
    return ok_all

def check_home_page() -> bool:
    p = FILES["home"]
    if not p.exists():
        err("Home page.tsx mancante.")
        return False
    s = read(p)
    ok_all = True

    # i18n namespaces
    if has(r"getTranslations\(\s*['\"]home['\"]\s*\)", s):
        ok("Home usa i18n 'home'")
    else:
        err("Home: manca getTranslations('home')")
        ok_all = False
    if has(r"getTranslations\(\s*['\"]news['\"]\s*\)", s):
        ok("Home usa i18n 'news' (per empty)")
    else:
        warn("Home non richiama 'news': assicurarsi che il messaggio empty arrivi dal namespace corretto")

    # verifico che NON chieda colonne inesistenti
    if has(r"select\([^)]*category", s) or has(r"select<[^>]*category", s):
        err("Home: sta selezionando 'category' (colonna NON presente).")
        ok_all = False
    if has(r"select\([^)]*cover_url", s) or has(r"select<[^>]*cover_url", s):
        err("Home: sta selezionando 'cover_url' (colonna NON presente).")
        ok_all = False
    if has(r"\.order\(\s*['\"]created_at['\"]", s):
        warn("Home: ordina per created_at. Va bene SOLO se la colonna esiste. Consigliato usare 'id'.")

    # garantisco che ordini per qualcosa
    if has(r"\.order\(", s):
        ok("Home: order presente")
    else:
        warn("Home: manca .order(...) (consigliato .order('id', {ascending:false}))")

    return ok_all

def check_article_card() -> bool:
    p = FILES["article_card"]
    if not p.exists():
        warn("ArticleCard.tsx non trovato (ok se non usato).")
        return True
    s = read(p)
    ok_all = True
    if has(r"category\?:\s*string\s*\|\s*null", s):
        ok("ArticleCard.category opzionale/nullabile")
    else:
        err("ArticleCard: rendi 'category?: string | null'")
        ok_all = False
    if has(r"coverUrl\?:\s*string\s*\|\s*null", s):
        ok("ArticleCard.coverUrl opzionale/nullabile")
    else:
        err("ArticleCard: rendi 'coverUrl?: string | null'")
        ok_all = False
    return ok_all

def check_i18n() -> bool:
    ok_all = True
    for lang_key in ("i18n_it", "i18n_en"):
        p = FILES[lang_key]
        lang = "it" if "it" in lang_key else "en"
        if not p.exists():
            err(f"{lang}.json mancante")
            ok_all = False
            continue
        try:
            doc = json.loads(p.read_text(encoding="utf-8-sig"))
        except Exception as e:
            err(f"{lang}.json non valido: {e}")
            ok_all = False
            continue

        # chiavi minime
        missing = []
        for ns, keys in REQUIRED_I18N_KEYS[lang].items():
            if ns not in doc or not isinstance(doc[ns], dict):
                missing.extend([f"{ns}.{k}" for k in keys])
                continue
            for k in keys:
                if k not in doc[ns]:
                    missing.append(f"{ns}.{k}")
        if missing:
            err(f"{lang}.json chiavi mancanti: {', '.join(missing)}")
            ok_all = False
        else:
            ok(f"{lang}.json: chiavi richieste presenti")
    return ok_all

def check_next_config() -> bool:
    p = FILES["next_config"]
    if not p.exists():
        warn("next.config.mjs non trovato (ok se non usi immagini remote).")
        return True
    s = read(p)
    if "remotePatterns" in s or "images:" in s:
        ok("next.config.mjs: immagini remote configurate")
        return True
    warn("next.config.mjs: non vedo images.remotePatterns (es. placehold.co)")
    return True

def main():
    print(f"[START] Verifica PL-5b in: {ROOT}")
    if not WEBAPP.exists():
        err(f"Cartella webapp non trovata: {WEBAPP}")
        sys.exit(2)

    # Presenza file chiave
    all_ok = True
    for k in ("layout","home","news_slug","header","footer","logo"):
        all_ok &= must_exist(k)

    # Check specifici
    all_ok &= check_editorial_layout()
    all_ok &= check_layout_locale()
    all_ok &= check_home_page()
    all_ok &= check_article_card()
    all_ok &= check_i18n()
    all_ok &= check_next_config()

    print("\n===== RISULTATO FASE PL-5b =====")
    if all_ok:
        print("✅ Tutti i requisiti per chiudere la fase risultano soddisfatti.")
        sys.exit(0)
    else:
        print("❌ Mancano uno o più requisiti. Vedi dettagli sopra.")
        sys.exit(1)

if __name__ == "__main__":
    main()
