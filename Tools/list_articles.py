# -*- coding: utf-8 -*-
"""
Elenca articoli pubblicati: slug, locale, title.
Esegui:
  .\.venv\Scripts\python.exe Tools\list_articles.py
"""
import re
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

def load_env() -> dict:
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

def main():
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + "/rest/v1/articles"
    anon = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    headers = {"apikey": anon, "Authorization": f"Bearer {anon}", "Accept": "application/json"}
    params = {
        "select": "slug,locale,title,category,published_at",
        "published": "eq.true",
        "order": "published_at.desc",
        "limit": "100",
    }
    r = requests.get(url, headers=headers, params=params, timeout=15)
    r.raise_for_status()
    rows = r.json()
    print(f"[COUNT] {len(rows)}")
    for i, x in enumerate(rows, 1):
        print(f"{i:>2}) {x.get('locale')} | {x.get('slug')} | {x.get('title')} | {x.get('category')}")

if __name__ == "__main__":
    main()
