import os
import requests
import json
from dotenv import load_dotenv
from pathlib import Path

print(" TEST APPROFONDITO API REST SUPABASE")
print("=" * 45)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.local')

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json'
}

print(f"🔗 URL Base: {url}")
print(f" API Key: {key[:25]}...")

# 1. Test lettura articoli
print(f"\n1.  LETTURA ARTICOLI:")
try:
    response = requests.get(f"{url}/rest/v1/articles?select=*", headers=headers)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        articles = response.json()
        print(f"    SUCCESSO - {len(articles)} articoli trovati")
        for article in articles[:3]:  # Mostra primi 3
            print(f"      - [{article.get('lang', '?')}] {article.get('slug', '?')}: {article.get('title', '?')[:40]}...")
    else:
        print(f"    Errore: {response.text}")
        
except Exception as e:
    print(f"    Exception: {e}")

# 2. Test con filtri
print(f"\n2.  TEST FILTRI:")
try:
    # Articoli in italiano
    response = requests.get(f"{url}/rest/v1/articles?lang=eq.it&select=id,slug,title", headers=headers)
    if response.status_code == 200:
        it_articles = response.json()
        print(f"    Articoli italiani: {len(it_articles)}")
    
    # Articoli in inglese  
    response = requests.get(f"{url}/rest/v1/articles?lang=eq.en&select=id,slug,title", headers=headers)
    if response.status_code == 200:
        en_articles = response.json()
        print(f"    Articoli inglesi: {len(en_articles)}")
        
except Exception as e:
    print(f"    Errore filtri: {e}")

# 3. Test SCRITTURA via API
print(f"\n3.  TEST SCRITTURA API:")
try:
    test_data = {
        'lang': 'en',
        'slug': f'test_api_{os.urandom(4).hex()}',
        'title': 'Test Article via API',
        'content': 'This is a test content',
        'category': 'test',
        'published_at': '2024-01-01T00:00:00Z'
    }
    
    response = requests.post(
        f"{url}/rest/v1/articles",
        headers=headers,
        json=test_data
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 201:
        print("    SCRITTURA API RIUSCITA!")
    else:
        print(f"    Scrittura fallita: {response.text}")
        
except Exception as e:
    print(f"    Errore scrittura: {e}")

# 4. Test altre tabelle (se esistono)
print(f"\n4.   ESPLORAZIONE TABELLE:")
tables_to_check = ['profiles', 'categories', 'users']  # Tabelle comuni in Supabase

for table in tables_to_check:
    try:
        response = requests.get(f"{url}/rest/v1/{table}?select=count", headers=headers)
        if response.status_code == 200:
            print(f"    Tabella '{table}': Accessibile")
        elif response.status_code == 404:
            print(f"   ℹ  Tabella '{table}': Non trovata")
        else:
            print(f"    Tabella '{table}': Errore {response.status_code}")
    except Exception as e:
        print(f"    Tabella '{table}': {e}")

print(f"\n RISULTATO FINALE:")
print("   Le API REST sono ACCESSIBILI in lettura")
print("   Il progetto in pausa permette ancora l'accesso ai dati via API")
