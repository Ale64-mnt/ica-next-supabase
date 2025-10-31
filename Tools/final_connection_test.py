import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path
import urllib.parse

print(" TEST CONNESSIONE CON STRINGA CORRETTA")
print("=" * 45)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.db')

db_url = os.getenv('SUPABASE_DB_URL')

if not db_url:
    print("❌ SUPABASE_DB_URL non trovata")
    exit(1)

print(f"Stringa di connessione: {db_url}")

# Analizza la stringa per debug
try:
    parsed = urllib.parse.urlparse(db_url)
    print(f"Schema: {parsed.scheme}")
    print(f"Username: {parsed.username}")
    print(f"Hostname: {parsed.hostname}")
    print(f"Porta: {parsed.port}")
    print(f"Database: {parsed.path[1:]}")
    
    # Verifica username
    if parsed.username == 'postgres.twwgfrbcndouazujgcma':
        print(" USERNAME CORRETTO")
    else:
        print(f" USERNAME ERRATO: {parsed.username}")
        print("   Dovrebbe essere: postgres.twwgfrbcndouazujgcma")
        
except Exception as e:
    print(f" Errore parsing URL: {e}")

# Test connessione database
print(f"\n Tentativo connessione...")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Test versione PostgreSQL
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(" CONNESSIONE DATABASE RIUSCITA!")
    print(f" PostgreSQL: {version[0]}")
    
    # Test conteggio articoli
    cursor.execute('SELECT COUNT(*) FROM articles;')
    count = cursor.fetchone()[0]
    print(f" Articoli nel database: {count}")
    
    # Test scrittura
    print(f"  Test scrittura...")
    cursor.execute('SELECT NOW() as current_time;')
    current_time = cursor.fetchone()[0]
    print(f" Scrittura funzionante - Time: {current_time}")
    
    cursor.close()
    conn.close()
    
    print(f"\n TUTTO FUNZIONA! COLLEGAMENTO SUPABASE COMPLETO! ")
    
except psycopg2.OperationalError as e:
    print(f" Errore operazionale: {e}")
    print(f" Controlla:")
    print(f"   - Username e password")
    print(f"   - Host e porta")
    print(f"   - Connessione internet")
    
except Exception as e:
    print(f" Errore generico: {e}")
