import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path
import urllib.parse

print("🎯 TEST CON PASSWORD CODIFICATA")
print("=" * 35)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.db')

db_url = os.getenv('SUPABASE_DB_URL')

if not db_url:
    print("❌ SUPABASE_DB_URL non trovata")
    exit(1)

print(f"Stringa di connessione: {db_url}")

# Verifica parsing
try:
    parsed = urllib.parse.urlparse(db_url)
    print(f" Schema: {parsed.scheme}")
    print(f" Username: {parsed.username}")
    print(f" Hostname: {parsed.hostname}")
    print(f" Porta: {parsed.port}")
    print(f" Database: {parsed.path[1:]}")
    
    # Decodifica la password per verifica
    if parsed.password:
        decoded_password = urllib.parse.unquote(parsed.password)
        print(f" Password (decodificata): {decoded_password}")
    
except Exception as e:
    print(f" Errore parsing: {e}")

# Test connessione
print(f"\n Tentativo connessione...")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(" CONNESSIONE RIUSCITA!")
    print(f" PostgreSQL: {version[0]}")
    
    # Test lettura articoli
    cursor.execute('SELECT COUNT(*) FROM articles;')
    count = cursor.fetchone()[0]
    print(f" Articoli nel database: {count}")
    
    # Test scrittura
    cursor.execute('SELECT NOW() as current_time;')
    current_time = cursor.fetchone()[0]
    print(f"  Scrittura funzionante - Time: {current_time}")
    
    cursor.close()
    conn.close()
    
    print(f"\n TUTTO FUNZIONA! COLLEGAMENTO COMPLETO! ")
    
except Exception as e:
    print(f" Errore connessione: {e}")
    print(f" Possibili cause:")
    print(f"   - Host potrebbe essere aws-1-eu-west-3 invece di aws-1-eu-west-2")
    print(f"   - Progetto potrebbe essere ancora in pausa")
    print(f"   - Credenziali potrebbero essere obsolete")
