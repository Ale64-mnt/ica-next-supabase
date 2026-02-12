#!/usr/bin/env python3
"""
Script Automatico per Inserire News Multilingua in Supabase
Versione per ambiente venv - Cartella Tools
"""

import requests
import json
from datetime import datetime, timezone
import sys
import os

# Aggiungi il path per importare eventuali moduli condivisi
sys.path.append(os.path.dirname(__file__))

# Configurazione Supabase (usa le stesse credenziali dello script interattivo)
SUPABASE_URL = "https://twwgfrbcndouazujgcma.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d2dmcmJjbmRvdWF6dWpnY21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTI5MDcsImV4cCI6MjA3Mjc4ODkwN30.zAYybezGYlZMRO1QXifWV0nQw18aF9A7MGUE8EB1v3A"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Configurazione fissa per le immagini (stesse per tutte le lingue)
IMAGE_URL = "/covers/categories/eu-updates/eu-updates-1536x1024.webp"
THUMB_URL = "/covers/categories/eu-updates/eu-updates-1536x1024.webp"

# CATEGORIA FISSA
CATEGORIA = "eu-updates"


# Testi per image_alt in base alla lingua
IMAGE_ALT_TEXTS = {
    'it': 'Infografica “Aggiornamenti UE” che mostra la bandiera dell’Unione europea.',
    'en': 'EU Updates infographic showing the European Union flag.', 
    'es': 'Infografía “Actualizaciones de la UE” que muestra la bandera de la Unión Europea.',
    'de': 'Infografik „EU-Updates“ mit der Flagge der Europäischen Union.',
    'fr': 'Infographie « Mises à jour de l’UE » montrant le drapeau de l’Union européenne.'
}

# Dati per ogni news in diverse lingue
NEWS_DATA = [
   
   # Italiano
    {
        "title": "Report riepilogativo sulle tendenze delle campagne malevole analizzate dal CERT-AGID nel 2025",
        "slug": "report-cert-agid-tendenze-campagne-malevole-2025",
        "excerpt": "Il CERT-AGID pubblica il report annuale sulle 3.620 campagne malevole osservate nel 2025, evidenziando phishing PagoPA, abuso della PEC, smishing e crescente uso dell’IA nelle truffe digitali.",
        "body_md": "**Fonte:** CERT-AGID – cert-agid.gov.it\n"
                   "**Data di pubblicazione:** 10 febbraio 2026\n"
                   "**Link ufficiale:** https://cert-agid.gov.it/news/report-riepilogativo-sulle-tendenze-delle-campagne-malevole-analizzate-dal-cert-agid-nel-2025/\n\n"
                   "**Riassunto:** Il CERT-AGID presenta un’analisi delle 3.620 campagne malevole osservate nel corso del 2025, con oltre 51.000 Indicatori di Compromissione (IoC) condivisi con la propria constituency. Il report evidenzia la diffusione di phishing a tema PagoPA (falsi solleciti di pagamento per presunte multe), l’aumento dell’abuso della PEC per campagne di phishing bancario e distribuzione di malware, e la crescita di campagne di smishing finalizzate all’installazione di software malevolo sui dispositivi mobili.\n\n"
                   "**Trend principali:** Tra le tendenze rilevate emergono l’utilizzo della tecnica di ingegneria sociale ClickFix, il ruolo centrale dei malware infostealer nel furto di credenziali e dati sensibili e il crescente impiego dell’intelligenza artificiale per generare messaggi di phishing più credibili e diffusi su larga scala.\n\n"
                   "**Nota tecnica:** Un infostealer è un tipo di malware progettato per sottrarre credenziali, cookie e documenti dall’endpoint della vittima. Lo smishing è una forma di phishing veicolata tramite SMS. ClickFix è una tecnica di social engineering che induce l’utente a eseguire manualmente azioni che portano all’installazione di codice malevolo.",
        "locale": "it",
    },

]

def check_connection():
    """Verifica la connessione a Supabase"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/news?select=id&limit=1",
            headers=headers
        )
        return response.status_code in [200, 201]
    except:
        return False

def insert_news(news_data):
    """Inserisce la news in Supabase"""
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/news",
            headers=headers,
            json=news_data
        )
        
        if response.status_code in [200, 201]:
            return True, response.json()
        else:
            return False, f"Errore {response.status_code}: {response.text}"
            
    except Exception as e:
        return False, f"Errore di connessione: {str(e)}"

def main():
    """Funzione principale - Inserimento automatico"""
    print("=" * 60)
    print("🤖 SCRIPT AUTOMATICO INSERIMENTO NEWS")
    print("🌐 Versione Multilingua (IT, EN, ES, DE, FR)")
    print(f"📁 Categoria: {CATEGORIA}")
    print("=" * 60)
    
    # Verifica connessione
    if not check_connection():
        print("❌ ERRORE: Connessione a Supabase fallita")
        print("💡 Verifica le credenziali e la connessione internet")
        return
    
    print("✅ Connessione Supabase: ATTIVA")
    print(f"📝 Trovati {len(NEWS_DATA)} news da inserire")
    print("-" * 60)
    
    success_count = 0
    errors = []
    
    for i, news in enumerate(NEWS_DATA, 1):
        locale = news['locale']
        
        # Prepara i dati per l'inserimento CON CATEGORIA
        news_data = {
            'title': news['title'],
            'slug': news['slug'],
            'excerpt': news['excerpt'],
            'body_md': news['body_md'],
            'locale': locale,
            'category': CATEGORIA,
            'image_url': IMAGE_URL,
            'thumb_url': THUMB_URL,
            'image_alt': IMAGE_ALT_TEXTS[locale],
            'published_at': datetime.now(timezone.utc).isoformat()
        }
        
        print(f"🔄 Inserimento {i}/{len(NEWS_DATA)}: {news['title']} ({locale})...")
        
        # Inserimento
        success, result = insert_news(news_data)
        
        if success:
            print(f"   ✅ SUCCESSO: {news['title']}")
            success_count += 1
        else:
            print(f"   ❌ ERRORE: {result}")
            errors.append(f"{news['title']} ({locale}): {result}")
    
    # Riepilogo
    print("\n" + "=" * 60)
    print("📊 RIEPILOGO INSERIMENTO")
    print("=" * 60)
    print(f"✅ News inserite con successo: {success_count}/{len(NEWS_DATA)}")
    print(f"📁 Categoria assegnata: {CATEGORIA}")
    
    if errors:
        print(f"❌ Errori riscontrati: {len(errors)}")
        for error in errors:
            print(f"   • {error}")
    else:
        print("🎉 Tutte le news sono state inserite correttamente!")
    
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Script interrotto dall'utente")
    except Exception as e:
        print(f"\n❌ Errore imprevisto: {e}")