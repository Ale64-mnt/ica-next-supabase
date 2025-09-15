# tools/fix_dynamic_routes.py
# -*- coding: utf-8 -*-
"""
Disattiva le rotte dinamiche in conflitto ([id] vs [slug]) mantenendo solo [slug].
Sposta eventuali directory [id] in webapp/_trash/dynamic-id-<timestamp>/... (backup sicuro).
Percorsi considerati (se esistono):
  - app/[locale]/news/[id]
  - app/[locale]/blog/[id]
  - app/news/[id]
  - app/blog/[id]
"""

from __future__ import annotations
import shutil
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"
APP = WEBAPP / "app"

CANDIDATES = [
    APP / "[locale]" / "news" / "[id]",
    APP / "[locale]" / "blog" / "[id]",
    APP / "news" / "[id]",
    APP / "blog" / "[id]",
]

def move_to_trash(path: Path) -> Path:
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    trash_base = WEBAPP / "_trash" / f"dynamic-id-{ts}"
    rel = path.relative_to(WEBAPP)
    dest = trash_base / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(path), str(dest))
    return dest

def main():
    if not APP.exists():
        raise SystemExit(f"[ERR] cartella app non trovata: {APP}")

    moved = []
    for p in CANDIDATES:
        if p.exists():
            dest = move_to_trash(p)
            moved.append((p, dest))

    if not moved:
        print("[OK] Nessuna cartella [id] in conflitto trovata. Nulla da fare.")
        return

    print("[UP] Cartelle [id] spostate in _trash per evitare conflitti:")
    for src, dst in moved:
        print(f" - {src.relative_to(WEBAPP)}  ->  {dst.relative_to(WEBAPP)}")

    print("\n[HINT] Riavvia `npm run dev`. Ora Next non vedrà più segmenti dinamici diversi sullo stesso livello.")

if __name__ == "__main__":
    main()
