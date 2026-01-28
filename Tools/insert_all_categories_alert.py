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
        "title": "Avviso phishing sull’Agenzia delle Entrate – falso deposito cauzionale",
        "slug": "avviso-phishing-agenzia-entrate-falso-deposito-cauzionale",
        "excerpt": "L’Agenzia delle Entrate avverte su messaggi fraudolenti che usano il pretesto di un presunto mancato versamento di un deposito cauzionale in controversie internazionali per sottrarre dati e denaro.",
        "body_md": "**Fonte:** Agenzia delle Entrate – agenziaentrate.gov.it\n"
                   "**Data di pubblicazione:** 26 gennaio 2026\n"
                   "**Link ufficiale:** https://www.agenziaentrate.gov.it/portale/avviso-del-26-gennaio-2026\n\n"
                   "**Riassunto:** L’Agenzia delle Entrate segnala la circolazione di messaggi fraudolenti che utilizzano come pretesto il presunto “mancato versamento del deposito cauzionale in controversie internazionali”. Le comunicazioni impiegano un linguaggio pseudo-giuridico per apparire credibili e urgenti, spingendo il destinatario ad agire senza effettuare verifiche.\n\n"
                   "**Canale:** messaggi elettronici (email o canali digitali analoghi) che **non** provengono dall’Agenzia delle Entrate.\n\n"
                   "**Trucco principale:** il testo lascia intendere che sia necessario versare un “deposito cauzionale” o fornire informazioni sensibili per evitare conseguenze negative come sanzioni, perdita di una causa o blocco di fondi.\n\n"
                   "**Obiettivo della truffa:** indurre la vittima a cliccare su link che portano a siti contraffatti dove vengono richiesti dati personali, credenziali di accesso o coordinate bancarie, oppure a rispondere direttamente al messaggio fornendo informazioni identificative e finanziarie.\n\n"
                   "**Esempio tipico:** il destinatario riceve un’email che parla di “mancato versamento del deposito cauzionale in una controversia internazionale” e invita a cliccare su un link per “regolarizzare immediatamente la posizione”. Inserendo i dati del conto o delle carte, queste informazioni vengono raccolte dai truffatori e utilizzate per bonifici non autorizzati o furti di identità.\n\n"
                   "**Avvertenza ufficiale:** l’Agenzia delle Entrate ribadisce che **non richiede mai** il pagamento di depositi cauzionali tramite email né invita a inserire dati bancari o credenziali tramite link esterni. In presenza di messaggi di questo tipo, il comportamento corretto è non cliccare, non rispondere e cancellare la comunicazione, verificando solo attraverso i canali ufficiali.",
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