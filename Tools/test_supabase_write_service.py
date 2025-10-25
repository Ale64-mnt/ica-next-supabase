# Tools/test_supabase_write_service.py
import os
import requests
import json
from pathlib import Path
from datetime import datetime

def test_write_with_service_role():
    """Test di scrittura usando Service Role Key"""
    print("🔑 Test scrittura con Service Role Key...")
    
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
    service_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if not service_key:
        print("❌ SUPABASE_SERVICE_ROLE_KEY non trovata")
        return False
    
    print(f"✅ Service Role Key trovata: {service_key[:20]}...")
    
    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Dati di test
    test_data = {
        'title': f'Test Service Role {datetime.now().strftime("%H:%M:%S")}',
        'slug': f'test-service-{int(datetime.now().timestamp())}',
        'excerpt': 'Test di scrittura con Service Role Key',
        'body_md': '## Test riuscito!\n\nScrittura con Service Role Key funziona perfettamente!',
        'locale': 'it',
        'published': False,
        'created_at': datetime.now().isoformat(),
        'published_at': datetime.now().isoformat()
    }
    
    print("📝 Dati di test:")
    print(json.dumps(test_data, indent=2, ensure_ascii=False))
    
    try:
        response = requests.post(
            f"{url}/rest/v1/articles",
            headers=headers,
            json=test_data,
            timeout=10
        )
        
        print(f"📡 Risposta HTTP: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            print("✅ SCRITTURA CON SERVICE ROLE: SUCCESSO!")
            print(f"📄 Articolo creato con ID: {data[0]['id'] if isinstance(data, list) else data.get('id')}")
            return True
        else:
            print(f"❌ Scrittura fallita: HTTP {response.status_code}")
            print(f"📝 Messaggio: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Errore: {e}")
        return False

def verify_article_created():
    """Verifica che l'articolo sia stato creato"""
    print("\n🔍 Verifica articolo creato...")
    
    project_root = Path(__file__).parent.parent
    env_file = project_root / '.env.local'
    
    env_vars = {}
    with open(env_file, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                env_vars[key] = value
    
    url = env_vars['NEXT_PUBLIC_SUPABASE_URL']
    key = env_vars['NEXT_PUBLIC_SUPABASE_ANON_KEY']  # Usa anon key per leggere
    
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Cerca l'articolo di test più recente
        response = requests.get(
            f"{url}/rest/v1/articles?select=id,title,slug,created_at&order=created_at.desc&limit=5",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            articles = response.json()
            print("📊 Ultimi 5 articoli nel database:")
            for i, article in enumerate(articles, 1):
                print(f"   {i}. {article['title']}")
                print(f"      Slug: {article['slug']}")
                print(f"      Creato: {article['created_at'][:19]}")
            return True
        else:
            print(f"❌ Errore nella verifica: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Errore durante la verifica: {e}")
        return False

if __name__ == "__main__":
    print("🚀 AVVIO TEST SCRITTURA CON SERVICE ROLE KEY")
    print("=" * 50)
    
    # Esegui il test di scrittura
    success = test_write_with_service_role()
    
    if success:
        # Aspetta un momento per essere sicuro che il dato sia scritto
        import time
        time.sleep(2)
        
        # Verifica che l'articolo sia stato creato
        verify_article_created()
        print("\n🎉 SERVICE ROLE KEY FUNZIONA! Ora puoi leggere e scrivere su Supabase!")
    else:
        print("\n❌ Problema con la Service Role Key. Controlla:")
        print("   - La chiave è corretta nel .env.local")
        print("   - Il file .env.local è nella root del progetto")
        print("   - La Service Role Key non è scaduta")
    
    print("\n" + "=" * 50)