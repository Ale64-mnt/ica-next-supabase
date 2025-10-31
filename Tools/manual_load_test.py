import os
import psycopg2
from pathlib import Path

print(" TEST CARICAMENTO MANUALE VARIABILI")
print("=" * 45)

def load_env_file(file_path):
    """Carica manualmente un file .env"""
    env_vars = {}
    try:
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
        return env_vars
    except Exception as e:
        print(f"Errore caricamento {file_path}: {e}")
        return {}

# Carica tutti i file environment
project_root = Path(__file__).parent.parent
env_local_vars = load_env_file(project_root / '.env.local')
env_db_vars = load_env_file(project_root / '.env.db')

print(f"Variabili caricate da .env.local: {len(env_local_vars)}")
print(f"Variabili caricate da .env.db: {len(env_db_vars)}")

# Combina tutte le variabili
all_vars = {**env_local_vars, **env_db_vars}

print(f"\n VARIABILI TROVATE:")
for key, value in all_vars.items():
    if 'SUPABASE' in key or 'NEXT_PUBLIC' in key:
        print(f"  {key}: {value[:50]}...")

# Test connessione database
db_url = all_vars.get('SUPABASE_DB_URL')
if db_url:
    print(f"\n TEST CONNESSIONE CON: {db_url[:80]}...")
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(" CONNESSIONE RIUSCITA!")
        print(f" PostgreSQL: {version[0]}")
        
        cursor.execute('SELECT COUNT(*) FROM articles;')
        count = cursor.fetchone()[0]
        print(f" Articoli: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f" Errore connessione: {e}")
else:
    print(" SUPABASE_DB_URL non trovata")
