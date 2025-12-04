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
IMAGE_URL = "https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/News/alert/alert_symbol_full_tra.png"
THUMB_URL = "https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/News/alert/alert_symbol_thum.png"

# CATEGORIA FISSA
CATEGORIA = "cybersecurity-frauds"

# Testi per image_alt in base alla lingua
IMAGE_ALT_TEXTS = {
    'it': 'Badge "ALERT" per avvisi ufficiali su truffe e sicurezza.',
    'en': '"ALERT" badge for official warnings about frauds and security.', 
    'es': 'Insignia "ALERT" para avisos oficiales sobre fraudes y seguridad.',
    'de': '"ALERT"-Symbol für offizielle Warnungen vor Betrug und Sicherheitshinweisen.',
    'fr': 'Badge "ALERT" pour les avis officiels sur les fraudes et la sécurité.'
}

# Dati per ogni news in diverse lingue
NEWS_DATA = [
    # Italiano
{
    'title': "Attenzione alle truffe: Consob oscura 6 siti di servizi finanziari abusivi",
    'slug': "consob-oscura-siti-finanziari-abusivi-attenti-alle-truffe",
    'excerpt': "Consob oscura sei siti illegali che usavano pagine clonate, finti personaggi noti e contenuti generati con IA.",
    'body_md': r"""
**Fonte:** CONSOB – consob.it  
**Data di pubblicazione:** 27 novembre 2025  
**Consob**  
**Link ufficiale:** https://www.consob.it/documents/d/asset-library-1912910/pr_20251127  

La Consob comunica di aver ordinato il blocco di sei siti web che offrivano servizi finanziari in modo abusivo o promuovevano piattaforme di trading non autorizzate, tra cui un sito che sfruttava in modo improprio l’immagine di un noto giornalista per promuovere un broker illegale. Il comunicato segnala che i truffatori ricorrono sempre più a tecniche sofisticate: siti “clonati”, falsi profili social, video e contenuti generati con sistemi di intelligenza artificiale per rendere credibili offerte di investimento inesistenti.

Viene ricordato che, dal 2019, sono stati complessivamente oscurati quasi 1.500 siti abusivi e che la lista completa è consultabile sul portale Consob nella sezione “Watch for Scams!”.

Tipicamente, lo schema funziona così: l’utente vede una pubblicità o un video con il volto di un personaggio famoso che “consiglia” una piattaforma; dopo aver lasciato i propri dati, viene contattato da falsi consulenti che lo guidano ad aprire un conto, fare un primo versamento e visualizzare “guadagni” su una schermata di trading creata ad arte; quando prova a ritirare il denaro, vengono richiesti pagamenti aggiuntivi (tasse, costi di sblocco) oppure l’accesso viene bloccato e il sito sparisce.

Per proteggersi è essenziale: verificare sempre sul sito Consob se il soggetto è autorizzato; non fidarsi di offerte che promettono rendimenti elevati e garantiti; non inviare documenti o credenziali di home banking a soggetti contattati via social o messaggistica; considerare sospetto qualsiasi sito che usa volti noti o loghi istituzionali senza link verso domini ufficiali (.gov, .eu, .it).
""",
    'locale': 'it',
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