# Tools/db_query.py
# Esegue query SQL su Supabase/Postgres leggendo .env.db

import psycopg2
import os
from dotenv import load_dotenv

# Carica variabili da .env.db
load_dotenv(dotenv_path=".env.db")

DB_URL = os.getenv("SUPABASE_DB_URL")
if not DB_URL:
    raise RuntimeError("SUPABASE_DB_URL non trovato in .env.db")

def run_query(query: str):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    cur.execute(query)
    try:
        rows = cur.fetchall()
        for row in rows:
            print(row)
    except psycopg2.ProgrammingError:
        conn.commit()
        print("[OK] Query eseguita (nessun risultato da mostrare)")
    cur.close()
    conn.close()

if __name__ == "__main__":
    # Esempio: lista ultimi articoli
    run_query("SELECT id, slug, title FROM articles ORDER BY created_at DESC LIMIT 5;")
