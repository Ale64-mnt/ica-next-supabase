#!/usr/bin/env python3
"""
Script per inserire infografiche dalle cartelle Storage nei body delle news
"""

from supabase import create_client
import os
from pathlib import Path
from dotenv import load_dotenv

# Carica configurazione
project_root = Path(__file__).parent.parent
env_path = project_root / '.env.db'
load_dotenv(env_path)

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://twwgfrbcndouazujgcma.supabase.co')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d2dmcmJjbmRvdWF6dWpnY21hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzIxMjkwNywiZXhwIjoyMDcyNzg4OTA3fQ.L2-OOBTdIyKhubNMu47UhNrzEx7_xQb15hGecTQ9KWk')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def get_recent_news():
    """Recupera gli ultimi 5 record delle news"""
    try:
        response = supabase.table('news')\
            .select('id,slug,locale,title,body_md')\
            .order('created_at', desc=True)\
            .limit(5)\
            .execute()
        
        return response.data
    except Exception as e:
        print(f"❌ Errore recupero news: {e}")
        return []

def get_images_from_storage(slug):
    """Recupera tutte le immagini dalla cartella Storage corrispondente allo slug"""
    try:
        # Lista tutti i file nella cartella News/{slug}/
        response = supabase.storage.from_("images").list(f"News/{slug}")
        
        if not response:
            return []
        
        # Filtra solo i file immagine (escludi file di sistema)
        image_files = []
        for item in response:
            if (item['name'].endswith(('.webp', '.jpg', '.jpeg', '.png')) and 
                not item['name'].startswith('.')):
                image_files.append(item['name'])
        
        return sorted(image_files)  # Ordina per nome
        
    except Exception as e:
        print(f"❌ Errore lettura cartella {slug}: {e}")
        return []

def generate_image_markdown(slug, image_files):
    """Genera il markdown per le immagini"""
    if not image_files:
        return ""
    
    markdown_lines = ["\n\n## "]
    
    for i, image_file in enumerate(image_files, 1):
        image_url = f"https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/News/{slug}/{image_file}"
        markdown_lines.append(f"![Infografica {i}]({image_url})")
    
    return "\n".join(markdown_lines)

def update_news_body(news_id, new_body):
    """Aggiorna il body della news nel database"""
    try:
        response = supabase.table('news')\
            .update({'body_md': new_body})\
            .eq('id', news_id)\
            .execute()
        
        return response.data
    except Exception as e:
        print(f"❌ Errore aggiornamento news {news_id}: {e}")
        return None

def main():
    print("=" * 60)
    print("🖼️  INSERIMENTO INFOGRAFICHE NELLE NEWS")
    print("=" * 60)
    
    # Recupera le ultime 5 news
    print("\n🔄 Recupero ultime 5 news...")
    news_data = get_recent_news()
    
    if not news_data:
        print("❌ Nessuna news trovata")
        return
    
    print(f"📝 Trovate {len(news_data)} news:")
    for news in news_data:
        print(f"   • {news['slug']} ({news['locale']})")
    
    # Processa ogni news
    print("\n🔄 Ricerca e inserimento infografiche...")
    updated_count = 0
    
    for news in news_data:
        slug = news['slug']
        current_body = news['body_md'] or ""
        
        print(f"\n📰 Processing: {slug} ({news['locale']})")
        
        # Cerca immagini nella cartella Storage
        image_files = get_images_from_storage(slug)
        
        if not image_files:
            print(f"   ⚠️  Nessuna immagine trovata in News/{slug}/")
            continue
        
        print(f"   🖼️  Trovate {len(image_files)} immagini: {', '.join(image_files)}")
        
        # Verifica se le immagini sono già presenti nel body
        existing_images = sum(1 for img in image_files if img in current_body)
        if existing_images == len(image_files):
            print(f"   ✅ Immagini già presenti nel body")
            continue
        
        # Genera il markdown per le nuove immagini
        image_markdown = generate_image_markdown(slug, image_files)
        
        # Aggiungi al body esistente
        new_body = current_body + image_markdown
        
        # Aggiorna il database
        result = update_news_body(news['id'], new_body)
        if result:
            print(f"   ✅ Body aggiornato con {len(image_files)} infografiche")
            updated_count += 1
        else:
            print(f"   ❌ Errore nell'aggiornamento del body")
    
    # Risultati finali
    print("\n" + "=" * 60)
    print("📊 RIEPILOGO")
    print("=" * 60)
    print(f"📰 News processate: {len(news_data)}")
    print(f"✅ News aggiornate: {updated_count}")
    
    if updated_count > 0:
        print(f"\n🎯 Infografiche inserite correttamente!")
        print("💡 Le immagini sono state aggiunte alla fine di ogni body news")
    else:
        print(f"\nℹ️  Nessun aggiornamento necessario")

if __name__ == "__main__":
    main()