# Tools/test_specific_tables.py
import os
import requests
from pathlib import Path

def test_specific_tables():
    """Test tabelle specifiche che dovrebbero esistere nel tuo progetto"""
    
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
    
    # AGGIORNA QUESTA LISTA CON LE TABELLE DEL TUO PROGETTO
    expected_tables = [
        'profiles',  # Tabella comune per i profili utente
        'users',     # Tabella utenti
        'products',  # Tabella prodotti (se e-commerce)
        'orders',    # Tabella ordini
        # Aggiungi altre tabelle che ti aspetti
    ]
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    print("🎯 Test tabelle specifiche del progetto...")
    
    for table in expected_tables:
        try:
            test_url = f"{url}/rest/v1/{table}?limit=1"
            response = requests.get(test_url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                count = len(response.json())
                print(f"✅ '{table}': ESISTE ({count} records)")
            elif response.status_code == 404:
                print(f"❌ '{table}': NON ESISTE")
            else:
                print(f"⚠️  '{table}': HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ '{table}': ERRORE - {e}")

if __name__ == "__main__":
    test_specific_tables()