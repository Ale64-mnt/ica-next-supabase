# Tools/test_supabase_write.py
import os
import requests
import json
from pathlib import Path
from datetime import datetime

def test_write_operation():
    """Test di scrittura su Supabase"""
    print("🧪 Test scrittura Supabase...")
    
    # Carica env
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
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    }
    
    # Dati di test
    test_data = {
        'title': f'Test articolo {datetime.now().strftime("%H:%M:%S")}',
        'slug': f'test-{datetime.now().timestamp()}',
        'excerpt': 'Questo è un articolo di test',
        'body_md': 'Contenuto di test per verificare la scrittura',
        'locale': 'it',
        'published': False
    }
    
    try:
        # Prova a scrivere nella tabella articles
        response = requests.post(
            f"{url}/rest/v1/articles",
            headers=headers,
            json=test_data,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("✅ SCRITTURA SU SUPABASE: SUCCESSO!")
            print(f"   Articolo di test creato: {test_data['title']}")
            return True
        else:
            print(f"❌ Scrittura fallita: HTTP {response.status_code}")
            print(f"   Messaggio: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante la scrittura: {e}")
        return False

if __name__ == "__main__":
    success = test_write_operation()
    if success:
        print("\n🎉 Tutto funziona! Puoi leggere e scrivere su Supabase!")
    else:
        print("\n⚠️  Problema con la scrittura. Controlla i permessi RLS.")