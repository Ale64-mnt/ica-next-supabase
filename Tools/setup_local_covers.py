# -*- coding: utf-8 -*-
r"""
Setup immagini locali per gli articoli e normalizzazione cover_url.

Funzioni:
- Crea webapp/public/covers/ e un placeholder.svg se non presenti
- Copia immagini da una cartella sorgente dentro public/covers/ rinominando per slug
- Normalizza cover_url nel DB: preferisce file locali, fallback a /covers/placeholder.svg
- Report finale

Uso (PowerShell):
  .\.venv\Scripts\python.exe Tools\setup_local_covers.py --src "C:\path\alle\immagini"
Opzioni:
  --src "DIR"           Cartella sorgente immagini (facoltativa). I file devono chiamarsi come lo slug
                        (es: guida-sicurezza-digitale.jpg). Se omessa, non copia nulla.
  --ext-priority "jpg,png,jpeg"
                        Ordine preferito delle estensioni quando si cercano file esistenti (default: jpg,png,jpeg).
  --dry-run             Non scrive nulla su disco e non aggiorna il DB; mostra solo cosa farebbe.
  --only-files          Esegue SOLO la parte filesystem (cartelle, placeholder, copia immagini).
  --only-db             Esegue SOLO la normalizzazione nel DB (non tocca file).
Prerequisiti:
- .env.local in root con NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
"""

import argparse
import json
import os
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

import requests

# -----------------------------------------------------------------------------
# Costanti percorso
# -----------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]
WEBAPP_DIR = ROOT / "webapp"
PUBLIC_DIR = WEBAPP_DIR / "public"
COVERS_DIR = PUBLIC_DIR / "covers"
ENV_FILE = ROOT / ".env.local"

PLACEHOLDER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <defs>
    <style>
      .bg { fill: #f2f2f2; }
      .rect { fill: #d9d9d9; }
      .txt { font: 48px sans-serif; fill: #777; }
    </style>
  </defs>
  <rect class="bg" width="100%" height="100%"/>
  <rect class="rect" x="100" y="120" width="1000" height="560" rx="24"/>
  <text class="txt" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">No cover</text>
</svg>
""".strip()

# -----------------------------------------------------------------------------
# Util
# -----------------------------------------------------------------------------

def load_env(path: Path) -> Dict[str, str]:
    if not path.exists():
        raise RuntimeError(f".env.local non trovato: {path}")
    env: Dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^([A-Za-z0-9_]+)=(.*)$", line)
        if not m:
            continue
        k, v = m.group(1), m.group(2)
        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
            v = v[1:-1]
        env[k] = v
    return env


def ensure_dirs(dry: bool = False) -> None:
    for d in (WEBAPP_DIR, PUBLIC_DIR, COVERS_DIR):
        if not d.exists():
            if dry:
                print(f"[DRY] mkdir {d}")
            else:
                d.mkdir(parents=True, exist_ok=True)
                print(f"[OK] creato: {d}")


def ensure_placeholder(dry: bool = False) -> None:
    target = COVERS_DIR / "placeholder.svg"
    if target.exists():
        print("[SKIP] placeholder.svg già presente")
        return
    if dry:
        print(f"[DRY] write {target}")
    else:
        target.write_text(PLACEHOLDER_SVG, encoding="utf-8")
        print("[OK] creato placeholder.svg")


def find_first_existing(base_dir: Path, slug: str, exts: List[str]) -> Optional[Path]:
    for ext in exts:
        p = base_dir / f"{slug}.{ext}"
        if p.exists():
            return p
    return None


@dataclass
class CopyResult:
    copied: List[Tuple[str, str]]  # (slug, filename)
    missing: List[str]             # slug senza file sorgente
    skipped: List[str]             # file già presenti


def copy_images_from_src(
    src_dir: Optional[Path],
    slugs: Iterable[str],
    ext_priority: List[str],
    dry: bool = False
) -> CopyResult:
    copied: List[Tuple[str, str]] = []
    missing: List[str] = []
    skipped: List[str] = []

    if not src_dir:
        print("[INFO] --src non fornito: salto la copia immagini.")
        return CopyResult(copied, missing, skipped)

    if not src_dir.exists():
        raise RuntimeError(f"Cartella sorgente non trovata: {src_dir}")

    for slug in slugs:
        src_path = find_first_existing(src_dir, slug, ext_priority)
        if not src_path:
            missing.append(slug)
            continue

        dst_path = COVERS_DIR / src_path.name  # mantiene estensione
        if dst_path.exists():
            skipped.append(slug)
            continue

        if dry:
            print(f"[DRY] copy {src_path} -> {dst_path}")
        else:
            shutil.copy2(src_path, dst_path)
            copied.append((slug, dst_path.name))

    return CopyResult(copied, missing, skipped)

# -----------------------------------------------------------------------------
# Supabase
# -----------------------------------------------------------------------------

@dataclass
class Article:
    id: str
    slug: str
    cover_url: Optional[str]

def fetch_articles(base_url: str, anon_key: str) -> List[Article]:
    url = base_url.rstrip("/") + "/rest/v1/articles"
    headers = {"apikey": anon_key, "Authorization": f"Bearer {anon_key}", "Accept": "application/json"}
    params = {"select": "id,slug,cover_url", "limit": "1000", "order": "slug.asc"}
    r = requests.get(url, headers=headers, params=params, timeout=25)
    if r.status_code != 200:
        raise RuntimeError(f"Errore fetch: {r.status_code} {r.text}")
    rows = r.json()
    return [Article(id=row["id"], slug=row["slug"], cover_url=row.get("cover_url")) for row in rows]


def desired_cover_path_for_slug(slug: str, exts: List[str]) -> str:
    # scegli l'estensione presente in /covers; altrimenti fallback jpg
    for ext in exts:
        if (COVERS_DIR / f"{slug}.{ext}").exists():
            return f"/covers/{slug}.{ext}"
    # nessun file -> placeholder
    if (COVERS_DIR / "placeholder.svg").exists():
        return "/covers/placeholder.svg"
    # safety fallback (se qualcuno ha cancellato il placeholder tra un run e l'altro)
    return "/covers/placeholder.svg"


@dataclass
class DbUpdateResult:
    to_update: List[Tuple[str, str, str]]  # (slug, old, new)
    updated: List[str]
    unchanged: List[str]

def compute_db_updates(articles: List[Article], ext_priority: List[str]) -> DbUpdateResult:
    to_update: List[Tuple[str, str, str]] = []
    unchanged: List[str] = []

    for a in articles:
        want = desired_cover_path_for_slug(a.slug, ext_priority)
        cur = (a.cover_url or "").strip()
        if cur != want:
            to_update.append((a.slug, cur, want))
        else:
            unchanged.append(a.slug)

    return DbUpdateResult(to_update=to_update, updated=[], unchanged=unchanged)


def apply_db_updates(
    base_url: str,
    service_key: str,
    changes: List[Tuple[str, str, str]],
    dry: bool = False
) -> List[str]:
    """Ritorna la lista di slug aggiornati."""
    if not changes:
        return []

    url = base_url.rstrip("/") + "/rest/v1/articles"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    updated: List[str] = []
    for slug, old, new in changes:
        if dry:
            print(f"[DRY] PATCH slug={slug} cover_url: '{old}' -> '{new}'")
            updated.append(slug)
            continue

        params = {"slug": f"eq.{slug}"}
        payload = {"cover_url": new}
        r = requests.patch(url, headers=headers, params=params, data=json.dumps(payload), timeout=25)
        if r.status_code in (200, 204):
            updated.append(slug)
            print(f"[OK] {slug} -> {new}")
        else:
            print(f"[ERR] {slug}: {r.status_code} {r.text}")

    return updated

# -----------------------------------------------------------------------------
# Main CLI
# -----------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(description="Setup immagini locali e normalizzazione cover_url.")
    ap.add_argument("--src", type=str, default=None, help="Cartella sorgente con immagini nominate per slug.")
    ap.add_argument("--ext-priority", type=str, default="jpg,png,jpeg", help="Ordine estensioni da considerare.")
    ap.add_argument("--dry-run", action="store_true", help="Non scrive su disco / DB; mostra le azioni.")
    ap.add_argument("--only-files", action="store_true", help="Esegue solo filesystem (cartelle, placeholder, copia).")
    ap.add_argument("--only-db", action="store_true", help="Esegue solo normalizzazione DB (no file).")
    args = ap.parse_args()

    if args.only_files and args.only_db:
        raise SystemExit("Impossibile usare --only-files e --only-db insieme.")

    ext_priority = [e.strip().lstrip(".").lower() for e in args.ext_priority.split(",") if e.strip()]
    src_dir = Path(args.src) if args.src else None

    print("[INFO] Root:", ROOT)
    print("[INFO] Covers dir:", COVERS_DIR)
    print("[INFO] Ext priority:", ext_priority)
    if src_dir:
        print("[INFO] Source dir:", src_dir)

    # 1) Filesystem
    if not args.only_db:
        ensure_dirs(dry=args.dry_run)
        ensure_placeholder(dry=args.dry_run)

    # 2) Supabase fetch (ci serve sempre per sapere gli slug, anche per la copia)
    env = load_env(ENV_FILE)
    base = env.get("NEXT_PUBLIC_SUPABASE_URL")
    anon = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    srv  = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base or not anon or not srv:
        raise RuntimeError("Variabili mancanti in .env.local (URL/ANON/SERVICE_ROLE).")

    articles = fetch_articles(base, anon)
    slugs = [a.slug for a in articles]
    print(f"[INFO] Articoli trovati: {len(slugs)}")

    # 3) Copia immagini (se richiesto)
    if not args.only_db:
        res = copy_images_from_src(src_dir, slugs, ext_priority, dry=args.dry_run)
        if src_dir:
            print(f"[COPY] Copiati: {len(res.copied)} | Già presenti: {len(res.skipped)} | Mancanti in src: {len(res.missing)}")

    # 4) Calcola e applica aggiornamenti DB
    if not args.only_files:
        plan = compute_db_updates(articles, ext_priority)
        print(f"[PLAN] Da aggiornare cover_url: {len(plan.to_update)} | Invariate: {len(plan.unchanged)}")
        updated = apply_db_updates(base, srv, plan.to_update, dry=args.dry_run)
        print(f"[DONE] Aggiornati nel DB: {len(updated)}")

    # 5) Suggerimenti finali
    print("\n[HINT] Metti i file immagine reali in:", COVERS_DIR)
    print("       Nomi richiesti: <slug>.<estensione> (default jpg/png/jpeg)")
    print("       Fallback usato se assenti: /covers/placeholder.svg")

if __name__ == "__main__":
    main()
