import os
import time
import requests
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

print(" TEST DOPO RIPRISTINO PROGETTO")
print("=" * 35)

def test_connection(max_attempts=10, delay=30):
    """Testa la connessione con tentativi multipli"""
    
    # Carica variabili
    project_root = Path(__file__).parent.parent
    load_dotenv(project_root / '.env.local')
    load_dotenv(project_root / '.env.db')
    
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    db_url = os.getenv('SUPABASE_DB_URL')
    
    if not all([url, key, db_url]):
        print(" Configurazione incompleta")
        return False
    
    print(f"Testing: {url}")
    
    for attempt in range(1, max_attempts + 1):
        print(f"\nTentativo {attempt}/{max_attempts}...")
        
        # Test API
        try:
            response = requests.get(f"{url}/rest/v1/", headers={
                'apikey': key,
                'Authorization': f'Bearer {key}'
            }, timeout=10)
            
            if response.status_code == 200:
                print(" API Supabase: FUNZIONANTE")
                
                # Test Database
                try:
                    conn = psycopg2.connect(db_url)
                    cursor = conn.cursor()
                    cursor.execute('SELECT version();')
                    version = cursor.fetchone()
                    print(" Database: FUNZIONANTE")
                    print(f" PostgreSQL: {version[0]}")
                    cursor.close()
                    conn.close()
                    return True
                    
                except Exception as db_error:
                    print(f" Database: {db_error}")
                    
            else:
                print(f" API: Status {response.status_code}")
                
        except Exception as e:
            print(f" Connessione: {e}")
        
        if attempt < max_attempts:
            print(f" Attesa {delay} secondi prima del prossimo tentativo...")
            time.sleep(delay)
    
    print(f"\n Il progetto potrebbe aver bisogno di più tempo per ripristinarsi completamente")
    return False

# Esegui test
if test_connection():
    print(f"\n PROGETTO COMPLETAMENTE RIPRISTINATO E FUNZIONANTE!")
else:
    print(f"\n  Il progetto potrebbe non essere ancora pronto")
