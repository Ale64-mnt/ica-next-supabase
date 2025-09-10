import os
import psycopg2
from dotenv import load_dotenv

# Carica le variabili da .env.db
load_dotenv(".env.db")

db_url = os.getenv("SUPABASE_DB_URL")

if not db_url:
    raise ValueError("❌ Variabile SUPABASE_DB_URL mancante in .env.db")

print("🔌 Tentativo di connessione a:", db_url)

try:
    with psycopg2.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT current_database(), current_user, version()")
            result = cur.fetchone()
            print("✅ Connessione riuscita!")
            print("📂 Database:", result[0])
            print("👤 Utente:", result[1])
            print("💻 Versione Postgres:", result[2].split()[0:2])
except Exception as e:
    print("❌ Errore di connessione:", e)
