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
        "title": "Analisi di una campagna Lumma Stealer con falso CAPTCHA tramite dominio italiano compromesso",
        "slug": "analisi-campagna-lumma-stealer-falso-captcha-dominio-italiano-compromesso",
        "excerpt": "CERT-AGID analizza una campagna malware che utilizza un falso CAPTCHA su un dominio italiano compromesso per indurre gli utenti a eseguire uno script PowerShell e installare il malware Lumma Stealer.",
        "body_md": "**Fonte:** CERT-AGID – cert-agid.gov.it\n"
                   "**Data di pubblicazione:** 13 gennaio 2025\n"
                   "**Link ufficiale:**https://cert-agid.gov.it/news/analisi-di-una-campagna-lumma-stealer-con-falso-captcha-condotta-attraverso-domino-italiano-compromesso//\n\n"
                   "**Riassunto:** Il CERT-AGID ha descritto una campagna malware che sfrutta un falso CAPTCHA ospitato su un dominio italiano compromesso per indurre gli utenti a eseguire uno script PowerShell dannoso. L’esecuzione dello script porta all’installazione del malware Lumma Stealer, progettato per esfiltrare credenziali di accesso e dati personali.\n\n"
                   "**Meccanismo della truffa (con esempio concreto):** Gli utenti visitano una pagina apparentemente legittima e vengono invitati a risolvere un CAPTCHA. In realtà, invece di verificare che l’utente sia umano, il falso controllo genera un comando PowerShell che scarica e installa il malware. Un esempio concreto è una falsa pagina di sicurezza che simula un controllo su servizi noti come GitHub: cliccando sul CAPTCHA, la vittima avvia inconsapevolmente l’esecuzione dello script malevolo, che consente il furto di credenziali di login, wallet di criptovalute e altri dati sensibili.",
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