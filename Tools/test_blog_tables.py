# Tools/test_blog_tables.py
import os
import requests
import json
from pathlib import Path
from datetime import datetime

def test_blog_tables():
    """Test specifico per le tabelle blog_posts e articles"""
    
    print("🎯 Test tabelle blog_posts e articles...")
    
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
    
    # Tabelle specifiche del tuo progetto
    blog_tables = [
        'blog_posts',
        'articles'
    ]
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    results = {}
    
    for table in blog_tables:
        print(f"\n📊 Testing tabella: {table}")
        try:
            test_url = f"{url}/rest/v1/{table}?limit=5"
            response = requests.get(test_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                record_count = len(data)
                print(f"✅ '{table}': ESISTE")
                print(f"   Record trovati: {record_count}")
                
                # Mostra qualche campo dei primi record
                if record_count > 0:
                    print(f"   Primo record:")
                    first_record = data[0]
                    for key in list(first_record.keys())[:3]:  # Mostra primi 3 campi
                        value = str(first_record.get(key, ''))[:50]
                        print(f"     - {key}: {value}")
                
                results[table] = {
                    'status': 'SUCCESS',
                    'record_count': record_count,
                    'sample_data': data[:2] if data else []  # Primi 2 records come sample
                }
                
            elif response.status_code == 404:
                print(f"❌ '{table}': NON TROVATA")
                results[table] = {'status': 'NOT_FOUND'}
            else:
                error_msg = f"HTTP {response.status_code}"
                if response.text:
                    error_msg += f" - {response.text[:100]}"
                print(f"⚠️  '{table}': {error_msg}")
                results[table] = {'status': 'ERROR', 'message': error_msg}
                
        except Exception as e:
            print(f"❌ '{table}': ERRORE - {e}")
            results[table] = {'status': 'EXCEPTION', 'message': str(e)}
    
    # Salva risultati dettagliati
    report_file = project_root / f"blog_tables_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Report dettagliato salvato in: {report_file}")
    
    # Riassunto finale
    print("\n" + "="*50)
    print("📋 RIASSUNTO FINALE")
    print("="*50)
    
    success_count = sum(1 for r in results.values() if r['status'] == 'SUCCESS')
    
    for table, result in results.items():
        status_icon = '✅' if result['status'] == 'SUCCESS' else '❌'
        record_info = f" ({result['record_count']} records)" if result['status'] == 'SUCCESS' else ''
        print(f"{status_icon} {table}: {result['status']}{record_info}")
    
    if success_count == len(blog_tables):
        print(f"\n🎉 TUTTE LE TABELLE SONO ACCESSIBILI!")
        return True
    else:
        print(f"\n⚠️  Solo {success_count} su {len(blog_tables)} tabelle accessibili")
        return False

def test_table_structure():
    """Test per verificare la struttura delle tabelle"""
    print("\n🔍 Verifica struttura tabelle...")
    
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
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    # Test per vedere i metadati delle tabelle (limit=0 per solo struttura)
    tables = ['blog_posts', 'articles']
    
    for table in tables:
        print(f"\n🏗️  Struttura tabella: {table}")
        try:
            structure_url = f"{url}/rest/v1/{table}?limit=0"
            response = requests.get(structure_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Controlla gli header per informazioni sui campi
                print(f"✅ Struttura disponibile per: {table}")
                print(f"   Content-Type: {response.headers.get('content-type')}")
                print(f"   Content-Range: {response.headers.get('content-range')}")
            else:
                print(f"⚠️  Impossibile recuperare struttura: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ Errore struttura {table}: {e}")

if __name__ == "__main__":
    print("🚀 AVVIO TEST TABELLE BLOG")
    print("="*50)
    
    # Test accesso ai dati
    success = test_blog_tables()
    
    # Test struttura (opzionale)
    test_table_structure()
    
    print(f"\n🎯 RISULTATO FINALE: {'SUCCESSO' if success else 'PROBLEMI'}")
    
    # Exit code per scripting
    exit(0 if success else 1)