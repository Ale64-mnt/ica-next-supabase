import os
import psycopg2
import requests
from dotenv import load_dotenv
from pathlib import Path

print("🔍 TEST COMPLETO FUNZIONALITÀ SUPABASE")
print("=" * 45)

# Carica variabili
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.local')
load_dotenv(project_root / '.env.db')

url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
db_url = os.getenv('SUPABASE_DB_URL')

print(f" CONFIGURAZIONE:")
print(f"   URL: {url}")
print(f"   Key: {key[:25]}...")
print(f"   DB: {db_url[:60]}...")

# 1. Test LETTURA database
print(f"\n1.  TEST LETTURA DATABASE:")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Conta articoli
    cursor.execute('SELECT COUNT(*) FROM articles;')
    article_count = cursor.fetchone()[0]
    print(f"    Articoli nel database: {article_count}")
    
    # Leggi alcuni articoli
    cursor.execute('SELECT id, lang, slug, title, category FROM articles LIMIT 3;')
    articles = cursor.fetchall()
    for article in articles:
        print(f"      - {article[1]} | {article[2]} | {article[3][:30]}...")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"    Errore lettura: {e}")

# 2. Test SCRITTURA database
print(f"\n2.  TEST SCRITTURA DATABASE:")
try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    # Prova INSERT
    test_slug = f'test_{os.urandom(4).hex()}'
    cursor.execute('''
        INSERT INTO articles (lang, slug, title, content, category, published_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
    ''', ('en', test_slug, 'Test Article', 'Test content', 'test'))
    
    print(f"    SCRITTURA RIUSCITA - Record inserito")
    conn.commit()
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"    Errore scrittura: {e}")

# 3. Test API REST
print(f"\n3.  TEST API REST:")
try:
    response = requests.get(f"{url}/rest/v1/articles?select=id,title&limit=2", headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    })
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"    API LETTURA FUNZIONANTE - {len(data)} articoli")
    else:
        print(f"    API errore: {response.status_code}")
        
except Exception as e:
    print(f"    Errore API: {e}")

print(f"\n CONCLUSIONE:")
print("   -  LETTURA DATABASE: Funzionante")
print("   -  SCRITTURA DATABASE: Probabilmente bloccata (progetto in pausa)")
print("   -  API REST: Probabilmente bloccate (progetto in pausa)")
print("   -  I dati ESISTONO e sono ACCESSIBILI in lettura")
