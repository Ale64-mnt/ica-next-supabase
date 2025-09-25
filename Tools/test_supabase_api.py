# -*- coding: utf-8 -*-
"""
Verifica API Supabase (REST) leggendo .env.local in root.
- Usa anon key e RLS
- Restituisce fino a 3 articoli pubblicati
"""
import re
import sys
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

def load_env_from_file(path: Path) -> dict:
    if not path.exists():
        raise RuntimeError(f"❌ .env.local non trovato: {path}")
    env = {}
    for line in path.read_text(encoding="utf-8").splitlines():
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

def main():
    env = load_env_from_file(ENV_FILE)
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    anon = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not anon:
        raise RuntimeError("❌ Variabili mancanti: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY")

    rest = url.rstrip("/") + "/rest/v1/articles"
    headers = {
        "apikey": anon,
        "Authorization": f"Bearer {anon}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Prefer": "count=exact",
    }
    params = {
        "select": "id,slug,title,locale,category,published_at",
        "published": "eq.true",
        "order": "published_at.desc",
        "limit": "3",
    }

    print(f"[INFO] REST endpoint: {rest}")
    r = requests.get(rest, headers=headers, params=params, timeout=15)
    if r.status_code != 200:
        print("❌ Errore REST:", r.status_code, r.text)
        sys.exit(1)

    rows = r.json()
    print(f"[OK] Righe lette: {len(rows)}")
    for i, row in enumerate(rows, 1):
        print(f" {i}) {row.get('slug')} | {row.get('title')} | {row.get('locale')} | {row.get('category')} | {row.get('published_at')}")
    print("[DONE] test_supabase_api.py completato.")

if __name__ == "__main__":
    main()
