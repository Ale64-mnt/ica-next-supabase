# -*- coding: utf-8 -*-
"""
Diagnostica connessione Postgres diretta (opzionale).
Legge SUPABASE_DB_URL da .env.local se presente, altrimenti esce.
Non usato in produzione web: solo test/batch locali.
"""
import os, re, sys
from pathlib import Path
import psycopg2

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env.local"

def get_env(k: str, d: str = "") -> str:
    val = os.environ.get(k, d)
    if val:
        return val
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"): 
                continue
            m = re.match(r'^([A-Za-z0-9_]+)=(.*)$', line)
            if m and m.group(1) == k:
                v = m.group(2).strip()
                if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                    v = v[1:-1]
                return v
    return d

def main():
    dsn = get_env("SUPABASE_DB_URL", "")
    if not dsn:
        print("ℹ️  SUPABASE_DB_URL non definita. Salto test DB diretto.")
        sys.exit(0)

    print("[INFO] Connessione Postgres…")
    try:
        with psycopg2.connect(dsn) as conn:
            with conn.cursor() as cur:
                cur.execute("select version();")
                print("[OK] Versione:", cur.fetchone()[0])
                cur.execute("select count(*) from public.articles;")
                print("[OK] Totale articoli:", cur.fetchone()[0])
        print("[DONE] db_test.py completato.")
    except Exception as e:
        print("❌ Errore Postgres:", repr(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
