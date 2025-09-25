# -*- coding: utf-8 -*-
"""
Seed iniziale articoli (IT/EN) con SERVICE ROLE (bypassa RLS).
Esegui: .\.venv\Scripts\python.exe Tools\seed_articles.py
"""
import re
import sys
import json
from pathlib import Path
import requests
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

def load_env() -> dict:
    if not ENV_FILE.exists():
        raise RuntimeError(f".env.local mancante: {ENV_FILE}")
    env = {}
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^([A-Za-z0-9_]+)=(.*)$", line)
        if m:
            k, v = m.group(1), m.group(2)
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1]
            env[k] = v
    return env

SEED = [
    {
        "slug": "what-ethically-conscious-knowledge-means",
        "title": "What Ethically Conscious Knowledge Means",
        "summary": "A short evergreen explaining the idea behind ethically conscious learning.",
        "body_md": "# Ethically Conscious Knowledge\n\nWe align skills with responsibility and inclusion...",
        "cover_url": "https://images.unsplash.com/photo-1521791136064-7986c2920216",
        "locale": "en",
        "category": "evergreen",
        "published": True,
    },
    {
        "slug": "cosa-significa-conoscenza-consapevolmente-etica",
        "title": "Cosa significa conoscenza consapevolmente etica",
        "summary": "Un evergreen che chiarisce il nostro approccio formativo.",
        "body_md": "# Conoscenza consapevolmente etica\n\nUniamo competenza tecnica, responsabilità e inclusione...",
        "cover_url": "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d",
        "locale": "it",
        "category": "evergreen",
        "published": True,
    },
    {
        "slug": "perche-i-metodi-di-borsa-pubblici-non-reggono",
        "title": "Perché i metodi di borsa pubblici non reggono",
        "summary": "Anche se funzionano inizialmente, l'esposizione ne erode l'efficacia.",
        "body_md": "## Perché\nLa dinamica di mercato e l'arbitraggio riducono i vantaggi...",
        "cover_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
        "locale": "it",
        "category": "markets",
        "published": True,
    },
]

def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def main():
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    srv = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not srv:
        raise RuntimeError("NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local")

    rest = url.rstrip("/") + "/rest/v1/articles"
    headers = {
        "apikey": srv,
        "Authorization": f"Bearer {srv}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    for row in SEED:
        payload = dict(row)
        if payload.get("published") and not payload.get("published_at"):
            payload["published_at"] = now_utc_iso()
        params = {"slug": f"eq.{payload['slug']}"}
        r = requests.patch(rest, headers=headers, params=params, data=json.dumps(payload), timeout=20)
        if r.status_code not in (200, 204):
            r = requests.post(rest, headers=headers, data=json.dumps(payload), timeout=20)
        if r.status_code not in (200, 201):
            print(f"❌ Seed fallito per {payload['slug']}: {r.status_code} {r.text}")
            sys.exit(1)
        print(f"[OK] Upsert: {payload['slug']}")
    print("[DONE] seed_articles.py completato.")

if __name__ == "__main__":
    main()
