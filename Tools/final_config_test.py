import os
import sys
from pathlib import Path

print(" TEST FINALE CONFIGURAZIONE")
print("=" * 35)

def manual_env_loader():
    """Caricatore manuale di environment variables"""
    env_vars = {}
    
    # File da caricare
    files = [
        Path(__file__).parent.parent / '.env.local',
        Path(__file__).parent.parent / '.env.db'
    ]
    
    for file_path in files:
        if file_path.exists():
            print(f" Caricando: {file_path.name}")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip()
                            env_vars[key] = value
                            # Imposta nell'ambiente
                            os.environ[key] = value
                            print(f"    {key} = {value[:30]}...")
            except Exception as e:
                print(f"    Errore: {e}")
        else:
            print(f" {file_path.name}:  FILE NON TROVATO")
    
    return env_vars

# Esegui il caricamento
print("")
env_vars = manual_env_loader()

print(f"\n VERIFICA FINALE:")
required_vars = {
    'NEXT_PUBLIC_SUPABASE_URL': 'URL Supabase',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Chiave Supabase', 
    'SUPABASE_DB_URL': 'URL Database'
}

all_ok = True
for var, description in required_vars.items():
    value = os.getenv(var)
    if value:
        print(f" {description}: PRESENTE")
        print(f"   {value[:50]}...")
    else:
        print(f" {description}: MANCANTE")
        all_ok = False

if all_ok:
    print(f"\n TUTTE LE VARIABILI SONO CONFIGURATE CORRETTAMENTE!")
    print(f"   Puoi procedere con i test di connessione.")
else:
    print(f"\n  Configurazione incompleta. Controlla i file .env")
