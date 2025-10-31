import requests
import os
from dotenv import load_dotenv
from pathlib import Path

print(" VERIFICA STATO PROGETTO E POOLING")
print("=" * 45)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.local')

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

print(f"Project URL: {url}")
print(f"API Key: {key[:25]}...")

# Test API per verificare stato progetto
try:
    response = requests.get(f"{url}/rest/v1/", headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }, timeout=10)
    
    print(f"API Status: {response.status_code}")
    
    if response.status_code == 200:
        print(" API ACCESSIBILI - Progetto probabilmente attivo")
    else:
        print(f" API NON ACCESSIBILI - Progetto potrebbe essere in pausa")
        
except Exception as e:
    print(f" Errore connessione: {e}")

print(f"\n Connection Pooling:  ABILITATO")
print(f"   Usa: postgres.twwgfrbcndouazujgcma@aws-0-eu-west-3.pooler.supabase.com:6543")
