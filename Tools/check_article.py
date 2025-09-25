# -*- coding: utf-8 -*-
"""
Controllo presenza articolo per slug+locale via REST Supabase.
Esegui:
  .\.venv\Scripts\python.exe Tools\check_article.py "cosa-significa-conoscenza-consapevolmente-etica" it
"""
import sys
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
    if len(sys.argv) < 3:
        print("Uso: check_article.py <slug> <locale>")
        sys.exit(2)
    slug, locale = sys.argv[1], sys.argv[2]
    env = load_env()
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/") + "/rest/v1/articles"
    anon = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    headers = {"apikey": anon, "Authorization": f"Bearer {anon}", "Accept": "application/json"}
    params = {
        "select": "slug,locale,title,category,published,published_at",
        "slug": f"eq.{slug}",
        "locale": f"eq.{locale}",
        "published": "eq.true",
        "limit": "2",
    }
    r = requests.get(url, headers=headers, params=params, timeout=15)
    print("[STATUS]", r.status_code)
    print("[JSON]", r.json())
    if r.status_code == 200 and r.json():
        print("[OK] Articolo trovato.")
    else:
        print("[MISS] Nessun articolo con quello slug/locale pubblicato.")

if __name__ == "__main__":
    main()
