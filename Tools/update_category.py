# -*- coding: utf-8 -*-
r"""
Aggiorna il campo `category` per uno o più slug usando la SERVICE ROLE KEY (bypass RLS).

Uso (PowerShell):
  .\.venv\Scripts\python.exe Tools\update_category.py evergreen <slug1> [slug2] ...

Esempio:
  .\.venv\Scripts\python.exe Tools\update_category.py evergreen conoscenza-consapevolmente-etica guida-sicurezza-digitale
"""
import sys
import re
import json
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

def load_env() -> dict:
    env: dict[str, str] = {}
    if not ENV_FILE.exists():
        raise RuntimeError(f".env.local mancante: {ENV_FILE}")
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

def patch_category(base_url: str, srv_key: str, slug: str, category: str) -> bool:
    url = base_url.rstrip("/") + "/rest/v1/articles"
    headers = {
        "apikey": srv_key,
        "Authorization": f"Bearer {srv_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    params = {"slug": f"eq.{slug}"}
    payload = {"category": category}
    r = requests.patch(url, headers=headers, params=params, data=json.dumps(payload), timeout=20)
    if r.status_code in (200, 204):
        print(f"[OK] {slug} → category='{category}'")
        return True
    print(f"[ERR] {slug}: {r.status_code} {r.text}")
    return False

def main():
    if len(sys.argv) < 3:
        print("Uso: update_category.py <nuova_category> <slug1> [slug2] ...")
        sys.exit(2)

    category = sys.argv[1]
    slugs = sys.argv[2:]

    env = load_env()
    base = env.get("NEXT_PUBLIC_SUPABASE_URL")
    srv  = env.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base or not srv:
        raise RuntimeError("Chiavi mancanti in .env.local: NEXT_PUBLIC_SUPABASE_URL e/o SUPABASE_SERVICE_ROLE_KEY")

    ok = 0
    for slug in slugs:
        ok += 1 if patch_category(base, srv, slug, category) else 0

    print(f"[DONE] Aggiornati {ok}/{len(slugs)} slug.")

if __name__ == "__main__":
    main()
