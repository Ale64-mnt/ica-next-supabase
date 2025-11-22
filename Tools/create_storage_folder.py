#!/usr/bin/env python3
"""
Script per creare cartelle - VERSIONE FUNZIONANTE
"""

from supabase import create_client
import os
from pathlib import Path
from dotenv import load_dotenv

# Carica configurazione
project_root = Path(__file__).parent.parent
env_path = project_root / '.env.db'
load_dotenv(env_path)

# Configurazione
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://twwgfrbcndouazujgcma.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d2dmcmJjbmRvdWF6dWpnY21hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIxMjkwNywiZXhwIjoyMDcyNzg4OTA3fQ.L2-OOBTdIyKhubNMu47UhNrzEx7_xQb15hGecTQ9KWk')

# Inizializza client
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def get_recent_slugs():
    """Recupera gli ultimi 5 slug"""
    try:
        response = supabase.table('news')\
            .select('slug,locale,title,created_at')\
            .order('created_at', desc=True)\
            .limit(5)\
            .execute()
        
        return response.data
    except Exception as e:
        print(f"❌ Errore recupero slug: {e}")
        return []

def create_storage_folder(slug):
    """Crea cartella - VERSIONE SEMPLIFICATA E FUNZIONANTE"""
    try:
        # Crea un file placeholder
        file_path = f"News/{slug}/.folder_created"
        
        print(f"🔄 Creando: {file_path}")
        
        # Upload del file
        response = supabase.storage.from_("images").upload(
            file_path,
            b'Folder created by automation script',
            {"content-type": "text/plain"}
        )
        
        print(f"✅ Cartella creata: images/News/{slug}/")
        return True
        
    except Exception as e:
        print(f"❌ Errore {slug}: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🚀 CREAZIONE CARTELLE - VERSIONE FUNZIONANTE")
    print("=" * 60)
    
    # Recupera slug
    print("\n🔄 Recupero slug...")
    slugs_data = get_recent_slugs()
    
    if not slugs_data:
        print("❌ Nessuno slug trovato")
        return
        
    print(f"📝 Trovati {len(slugs_data)} slug")
    for item in slugs_data:
        print(f"   • {item['slug']} ({item['locale']})")
    
    # Crea cartelle
    print("\n🏗️  Creazione cartelle...")
    success_count = 0
    
    for item in slugs_data:
        slug = item['slug']
        if create_storage_folder(slug):
            success_count += 1
    
    # Risultati
    print("\n" + "=" * 60)
    print(f"🎯 COMPLETATO: {success_count}/{len(slugs_data)} cartelle create")
    
    if success_count > 0:
        print("\n📁 Struttura creata:")
        for item in slugs_data:
            print(f"   ✅ images/News/{item['slug']}/")

if __name__ == "__main__":
    main()