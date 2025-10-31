import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

print(" TEST CONNESSIONE DATABASE - PORTA DIRETTA")
print("=" * 45)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.db')

db_url = os.getenv('SUPABASE_DB_URL')
if not db_url:
    print("❌ SUPABASE_DB_URL non trovata")
    exit(1)

print(f"URL originale: {db_url}")

# Prova con porta 5432 invece di 6543
db_url_5432 = db_url.replace(':6543/', ':5432/')
print(f"URL con porta 5432: {db_url_5432}")

# Test connessione con porta 5432
try:
    print(" Tentativo connessione con porta 5432...")
    conn = psycopg2.connect(db_url_5432)
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(" CONNESSIONE RIUSCITA con porta 5432!")
    print(f" PostgreSQL: {version[0]}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f" Errore con porta 5432: {e}")

# Test connessione con porta 6543 (pooler)
try:
    print("\n Tentativo connessione con porta 6543 (pooler)...")
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(" CONNESSIONE RIUSCITA con pooler (6543)!")
    print(f" PostgreSQL: {version[0]}")
    cursor.close()
    conn.close()
except Exception as e:
    print(f" Errore con pooler (6543): {e}")
