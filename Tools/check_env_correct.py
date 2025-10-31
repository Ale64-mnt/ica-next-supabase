import os
import sys
from dotenv import load_dotenv
from pathlib import Path

print(" CHECK CONFIGURAZIONE - PERCORSI CORRETTI")
print("=" * 50)

# PERCORSI CORRETTI - un punto
project_root = Path(__file__).parent.parent
env_local = project_root / '.env.local'  # UN punto
env_db = project_root / '.env.db'        # UN punto

print(f"Project root: {project_root}")
print(f".env.local: {env_local} - {' ESISTE' if env_local.exists() else ' NON ESISTE'}")
print(f".env.db: {env_db} - {' ESISTE' if env_db.exists() else ' NON ESISTE'}")

# Carica i file
if env_local.exists():
    load_dotenv(env_local)
    print(" .env.local caricato")

if env_db.exists():
    load_dotenv(env_db) 
    print(" .env.db caricato")

# Leggi le variabili
print(f"\n VARIABILI CARICATE:")
url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
db_url = os.getenv('SUPABASE_DB_URL')

print(f"   URL: {url or ' NON TROVATO'}")
print(f"   KEY: {key and ' PRESENTE' or ' NON TROVATO'}")
print(f"   DB_URL: {db_url and ' PRESENTE' or ' NON TROVATO'}")

if url and key and db_url:
    print(f"\n TUTTA LA CONFIGURAZIONE È COMPLETA!")
else:
    print(f"\n  Configurazione incompleta")
