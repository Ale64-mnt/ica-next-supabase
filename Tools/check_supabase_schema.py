# Tools/check_supabase_schema.py
import os
import requests
import json
from pathlib import Path

def check_database_schema():
    """Controlla lo schema del database e le tabelle disponibili"""
    print("🔍 Controllo schema database Supabase...")
    
    # Carica env dalla root
    project_root = Path(__file__).parent.parent
    env_file = project_root / '.env.local'
    
    env_vars = {}
    with open(env_file, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                env_vars[key] = value
    
    url = env_vars['NEXT_PUBLIC_SUPABASE_URL']
    key = env_vars['NEXT_PUBLIC_SUPABASE_ANON_KEY']
    
    # Query per ottenere informazioni sulle tabelle
    try:
        # Prova a ottenere la lista delle tabelle
        tables_url = f"{url}/rest/v1/?limit=0"
        headers = {
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(tables_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print("✅ Connessione schema: SUCCESSO")
            
            # Controlla le tabelle di sistema
            system_tables = [
                'profiles', 'users', 'auth.users', 'customers', 
                'products', 'orders', 'settings'
            ]
            
            print("\n📊 Verifica tabelle comuni:")
            for table in system_tables:
                test_url = f"{url}/rest/v1/{table}?limit=1"
                try:
                    table_response = requests.get(test_url, headers=headers, timeout=5)
                    if table_response.status_code == 200:
                        print(f"✅ Tabella '{table}': ESISTE")
                    elif table_response.status_code == 404:
                        print(f"❌ Tabella '{table}': NON TROVATA")
                    else:
                        print(f"⚠️  Tabella '{table}': HTTP {table_response.status_code}")
                except Exception as e:
                    print(f"❌ Tabella '{table}': ERRORE - {e}")
            
            return True
            
        else:
            print(f"❌ Errore nel recupero schema: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante il check schema: {e}")
        return False

if __name__ == "__main__":
    check_database_schema()
    