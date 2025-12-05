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
   # English
{
    'title': "International takedown of cryptocurrency fraud network laundering over EUR 700 million",
    'slug': "international-crypto-fraud-network-takedown-eur-700-million",
    'excerpt': "Europol dismantles a large cryptocurrency fraud and money-laundering network worth over EUR 700 million.",
    'body_md': r"""
**Source:** Europol – europol.europa.eu  
**Publication date:** 04 December 2025  
**Official link:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network-laundering-over-eur-700-million  

Europol announced the dismantling, through an international operation, of a network running a large-scale cryptocurrency fraud and money-laundering scheme worth around EUR 700 million. Arrests and seizures involved individuals accused of organising fraudulent crypto investment schemes.  

In practice, the scam worked by offering cryptocurrency investments with fake returns; real funds were laundered through a network of accounts and shell companies, causing severe losses for investors.
""",
    'locale': 'en',
},

# Español
{
    'title': "Desmantelamiento internacional de una red de fraude en criptomonedas que blanqueó más de 700 millones EUR",
    'slug': "desmantelamiento-red-fraude-criptomonedas-700-millones-eur",
    'excerpt': "Europol desmantela una red internacional de fraude y blanqueo de criptomonedas valorada en más de 700 millones de euros.",
    'body_md': r"""
**Fuente:** Europol – europol.europa.eu  
**Fecha de publicación:** 04 de diciembre de 2025  
**Enlace oficial:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network-laundering-over-eur-700-million  

Europol anunció el desmantelamiento, en una operación internacional, de una red que gestionaba un importante esquema de fraude y blanqueo relacionado con criptomonedas — alrededor de 700 millones de euros. Entre las detenciones y los decomisos figuran personas acusadas de organizar inversiones fraudulentas en crypto.  

En la práctica, la estafa funcionaba ofreciendo inversiones en criptomonedas con rendimientos falsos; los fondos reales se blanqueaban mediante una red de cuentas y empresas ficticias, provocando graves pérdidas a los inversores.
""",
    'locale': 'es',
},

# Deutsch
{
    'title': "Internationale Zerschlagung eines Kryptowährungsbetrugsnetzwerks mit über 700 Millionen EUR Geldwäsche",
    'slug': "krypto-betrugsnetzwerk-zerschlagen-700-millionen-eur",
    'excerpt': "Europol zerschlägt ein internationales Kryptowährungsbetrugs- und Geldwäschenetzwerk im Umfang von über 700 Millionen EUR.",
    'body_md': r"""
**Quelle:** Europol – europol.europa.eu  
**Veröffentlichungsdatum:** 04. Dezember 2025  
**Offizieller Link:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network-laundering-over-eur-700-million  

Europol gab die Zerschlagung eines internationalen Netzwerks bekannt, das ein umfangreiches Betrugs- und Geldwäschesystem mit Kryptowährungen im Wert von rund 700 Millionen EUR betrieb. Zu den Festnahmen und Beschlagnahmungen gehören Personen, denen vorgeworfen wird, betrügerische Krypto-Investitionen organisiert zu haben.  

In der Praxis funktionierte der Betrug, indem Krypto-Investitionen mit falschen Renditen angeboten wurden; echte Gelder wurden über ein Netz von Konten und Scheinfirmen gewaschen, was zu erheblichen Verlusten für Anleger führte.
""",
    'locale': 'de',
},

# Français
{
    'title': "Démantèlement international d’un réseau de fraude aux cryptomonnaies blanchissant plus de 700 millions EUR",
    'slug': "demantelement-reseau-fraude-cryptomonnaies-700-millions-eur",
    'excerpt': "Europol démantèle un vaste réseau international de fraude et de blanchiment liés aux cryptomonnaies.",
    'body_md': r"""
**Source :** Europol – europol.europa.eu  
**Date de publication :** 04 décembre 2025  
**Lien officiel :** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network-laundering-over-eur-700-million  

Europol a annoncé le démantèlement, lors d’une opération internationale, d’un réseau impliqué dans un vaste système de fraude et de blanchiment lié aux cryptomonnaies — environ 700 millions d’euros. Les arrestations et saisies concernent des individus accusés d’avoir organisé de faux investissements en crypto.  

Dans la pratique, l’arnaque consistait à proposer des investissements en cryptomonnaies avec de faux rendements ; les fonds réels étaient blanchis via un réseau de comptes et de sociétés écrans, provoquant de lourdes pertes pour les investisseurs.
""",
    'locale': 'fr',
},

# Italiano
{
    'title': "International takedown of cryptocurrency fraud network laundering over EUR 700 million",
    'slug': "smantellamento-rete-frode-crypto-riciclaggio-700-milioni-eur",
    'excerpt': "Europol smantella una rete internazionale di frode e riciclaggio legata a criptovalute per oltre 700 milioni di euro.",
    'body_md': r"""
**Fonte:** Europol – europol.europa.eu  
**Data di pubblicazione:** 04 dicembre 2025  
**Link ufficiale:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network-laundering-over-eur-700-million  

Europol ha annunciato lo smantellamento, in un’operazione internazionale, di una rete che gestiva un vasto schema di frode e riciclaggio legato a criptovalute — circa 700 milioni di euro. Tra gli arresti e i sequestri figurano soggetti accusati di aver organizzato investimenti fraudolenti in crypto.  

In pratica, la truffa operava proponendo investimenti in criptovalute con rendimenti falsi; i fondi reali venivano riciclati tramite una rete di conti e società fittizie, provocando gravi perdite per gli investitori.
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