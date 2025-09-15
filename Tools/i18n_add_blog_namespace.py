# tools/i18n_add_blog_namespace.py
# -*- coding: utf-8 -*-
"""
Aggiorna/crea il namespace "blog" in webapp/messages/{it,en,es,fr,de}.json
- Legge i JSON con 'utf-8-sig' (gestisce BOM) e li riscrive SENZA BOM.
- Crea backup .bak-YYYYMMDD-HHMMSS prima di ogni modifica.
- Merge idempotente: aggiunge solo le chiavi mancanti, non sovrascrive quelle esistenti.
- Log sintetico di cosa è stato cambiato.
"""

from __future__ import annotations
import json
from pathlib import Path
from datetime import datetime

# === CONFIG ===
LOCALES = ["it", "en", "es", "fr", "de"]
MESSAGES_DIR = Path("webapp/messages")

BLOG_KEYS = {
    "title": {
        "it": "Blog",
        "en": "Blog",
        "es": "Blog",
        "fr": "Blog",
        "de": "Blog",
    },
    "intro": {
        "it": "Articoli e aggiornamenti.",
        "en": "Articles and updates.",
        "es": "Artículos y novedades.",
        "fr": "Articles et actualités.",
        "de": "Artikel und Neuigkeiten.",
    },
    "empty": {
        "it": "Nessun articolo pubblicato.",
        "en": "No posts yet.",
        "es": "Aún no hay artículos.",
        "fr": "Aucun article pour le moment.",
        "de": "Noch keine Beiträge.",
    },
    "prev": {
        "it": "Precedenti",
        "en": "Previous",
        "es": "Anteriores",
        "fr": "Précédents",
        "de": "Zurück",
    },
    "next": {
        "it": "Successivi",
        "en": "Next",
        "es": "Siguientes",
        "fr": "Suivants",
        "de": "Weiter",
    },
    "page": {
        "it": "Pagina",
        "en": "Page",
        "es": "Página",
        "fr": "Page",
        "de": "Seite",
    },
}

# === UTILS ===
def now_tag() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def ensure_dir(p: Path) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)

def load_json_tolerant(path: Path) -> dict:
    """
    Carica JSON tollerando BOM usando utf-8-sig.
    Se il file non esiste, ritorna {}.
    """
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8-sig") as f:
        return json.load(f)

def backup_file(path: Path) -> Path:
    bkp = path.with_suffix(path.suffix + f".bak-{now_tag()}")
    bkp.write_bytes(path.read_bytes())
    return bkp

def write_json_no_bom(path: Path, data: dict) -> None:
    # Scrive senza BOM (encoding 'utf-8' standard)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

def merge_blog_keys(doc: dict, locale: str) -> tuple[dict, list[str]]:
    """
    Aggiunge le chiavi mancanti sotto doc['blog'] per il locale dato.
    Ritorna (doc, added_keys).
    """
    blog = dict(doc.get("blog") or {})
    added = []
    for key, translations in BLOG_KEYS.items():
        if key not in blog:
            blog[key] = translations[locale]
            added.append(key)
    doc["blog"] = blog
    return doc, added

# === MAIN ===
def process_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    ensure_dir(path)
    exists = path.exists()

    try:
        doc = load_json_tolerant(path) if exists else {}
    except json.JSONDecodeError as e:
        raise SystemExit(f"[ERR] JSON non valido: {path} -> {e}")

    before = set((doc.get("blog") or {}).keys())
    doc, added_keys = merge_blog_keys(doc, locale)

    if not added_keys:
        # anche se nessuna chiave è stata aggiunta, se il file aveva BOM lo normalizziamo
        if exists:
            backup_file(path)
            write_json_no_bom(path, doc)
            print(f"[NF] {locale}.json – nessuna nuova chiave; normalizzato senza BOM")
        else:
            print(f"[OK] {locale}.json – già completo (nessuna azione)")
        return

    if exists:
        backup_file(path)

    write_json_no_bom(path, doc)
    print(f"[UP] {locale}.json – aggiunte: {', '.join(added_keys)} (BOM rimosso se presente)")

def main() -> None:
    base = Path(".").resolve()
    target_dir = (base / MESSAGES_DIR).resolve()
    if not target_dir.exists():
        raise SystemExit(f"[ERR] Cartella non trovata: {target_dir}")

    print(f"[START] Aggiornamento i18n in: {target_dir}")
    for loc in LOCALES:
        process_locale(loc)
    print("[DONE] Completato.")

if __name__ == "__main__":
    main()
