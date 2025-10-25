import os
import sys
from dotenv import load_dotenv
from pathlib import Path

print(" CHECK CONFIGURAZIONE SUPABASE")
print("=" * 40)

# Carica variabili da .env.local e .env.db nella ROOT
env_files = ['.env.local', '.env.db']
project_root = Path(__file__).parent.parent

for env_file in env_files:
    env_path = project_root / env_file
    if env_path.exists():
        load_dotenv(env_path)
        print(f" Caricato: {env_path}")
    else:
        print(f" Non trovato: {env_path}")

# Verifica configurazione
print(f"\n CONFIGURAZIONE:")
print(f"   SUPABASE_URL: {os.getenv('NEXT_PUBLIC_SUPABASE_URL', ' Mancante')}")
print(f"   SUPABASE_KEY: {os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ' Mancante')[:20]}...")
print(f"   DB_URL: {os.getenv('SUPABASE_DB_URL', ' Mancante')[:50]}...")

# Verifica Python environment
print(f"\n AMBIENTE PYTHON:")
print(f"   Python: {sys.version}")
print(f"   Path: {sys.prefix}")
