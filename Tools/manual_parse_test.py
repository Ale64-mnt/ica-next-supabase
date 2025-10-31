import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

print(" TEST CON PARSING MANUALE")
print("=" * 30)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.db')

db_url = os.getenv('SUPABASE_DB_URL')

if not db_url:
    print(" SUPABASE_DB_URL non trovata")
    exit(1)

print(f"Stringa originale: {db_url}")

# Parsing manuale per debug
if db_url.startswith('postgresql://'):
    parts = db_url.replace('postgresql://', '').split('@')
    if len(parts) == 2:
        user_pass = parts[0]
        host_db = parts[1]
        
        user_parts = user_pass.split(':')
        if len(user_parts) == 2:
            username = user_parts[0]
            password = user_parts[1]
            print(f"✅ Username: {username}")
            print(f" Password: {password[:5]}...")
        else:
            print(f" Formato user:password errato")
        
        print(f" Host+DB: {host_db}")
    else:
        print(f" Formato URL errato")

# Test connessione semplice
print(f"\n Tentativo connessione diretta...")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(" CONNESSIONE RIUSCITA!")
    print(f" PostgreSQL: {version[0]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f" Errore: {e}")
    print(f" La stringa potrebbe ancora avere problemi di formato")
