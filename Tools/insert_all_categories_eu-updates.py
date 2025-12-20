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
        "title": "ESAs publish key anti-fraud tips to help consumers recognise and prevent online scams",
        "slug": "esas-key-anti-fraud-tips-recognise-prevent-online-scams",
        "excerpt": "The European Supervisory Authorities have released new consumer factsheets with practical guidance to detect, prevent and respond to online frauds and scams, including crypto scams and AI-driven phishing.",
        "body_md": "**Source:** European Banking Authority (EBA), EIOPA, ESMA – eba.europa.eu\n"
                   "**Publication date:** 15 December 2025\n"
                   "**Official link:** https://www.eba.europa.eu/publications-and-media/press-releases/esas-publish-key-tips-help-consumers-detect-prevent-and-act-online-frauds-and-scams\n\n"
                   "**Summary:** The European Supervisory Authorities (EBA, EIOPA and ESMA) have published two factsheets aimed at consumers to help them identify, prevent and react to online fraud, including crypto scams and AI-based phishing. The materials provide practical examples and warning signs to distinguish fraudulent messages from genuine communications, such as unsolicited requests for personal data or offers that appear too good to be true.\n\n"
                   "The factsheets also explain key terms such as phishing—attempts to obtain sensitive data by posing as legitimate entities—and scams, defined as schemes designed to deceive consumers and steal money.",
        "locale": "en",
    },

    # Español
    {
        "title": "Las ESAs publican consejos clave contra el fraude para reconocer y prevenir estafas online",
        "slug": "esas-consejos-clave-anti-fraude-reconocer-prevenir-estafas-online",
        "excerpt": "Las Autoridades Europeas de Supervisión han publicado nuevos factsheets para ayudar a los consumidores a detectar, prevenir y actuar frente a fraudes online, incluidas estafas cripto y phishing con IA.",
        "body_md": "**Fuente:** Autoridad Bancaria Europea (EBA), EIOPA, ESMA – eba.europa.eu\n"
                   "**Fecha de publicación:** 15 de diciembre de 2025\n"
                   "**Enlace oficial:** https://www.eba.europa.eu/publications-and-media/press-releases/esas-publish-key-tips-help-consumers-detect-prevent-and-act-online-frauds-and-scams\n\n"
                   "**Resumen:** Las Autoridades Europeas de Supervisión (EBA, EIOPA y ESMA) han publicado dos factsheets dirigidos a los consumidores para ayudarles a identificar, prevenir y reaccionar ante fraudes online, incluidas estafas con criptomonedas y phishing basado en tecnologías de IA. Se ofrecen ejemplos prácticos y señales de alerta para distinguir mensajes fraudulentos de comunicaciones legítimas, como solicitudes inesperadas de datos personales u ofertas excesivamente atractivas.\n\n"
                   "Los factsheets también explican conceptos clave como phishing—intentos de obtener datos sensibles haciéndose pasar por entidades legítimas—y scam, entendido como fraudes diseñados para engañar y sustraer dinero.",
        "locale": "es",
    },

    # Deutsch
    {
        "title": "ESAs veröffentlichen zentrale Anti-Betrugs-Tipps zum Erkennen und Verhindern von Online-Scams",
        "slug": "esas-anti-betrugs-tipps-online-scams-erkennen-verhindern",
        "excerpt": "Die Europäischen Aufsichtsbehörden haben neue Factsheets veröffentlicht, die Verbraucher beim Erkennen, Vorbeugen und Reagieren auf Online-Betrug unterstützen sollen.",
        "body_md": "**Quelle:** Europäische Bankenaufsichtsbehörde (EBA), EIOPA, ESMA – eba.europa.eu\n"
                   "**Veröffentlichungsdatum:** 15. Dezember 2025\n"
                   "**Offizieller Link:** https://www.eba.europa.eu/publications-and-media/press-releases/esas-publish-key-tips-help-consumers-detect-prevent-and-act-online-frauds-and-scams\n\n"
                   "**Zusammenfassung:** Die Europäischen Aufsichtsbehörden (EBA, EIOPA und ESMA) haben zwei Factsheets für Verbraucher veröffentlicht, um sie beim Erkennen, Verhindern und richtigen Reagieren auf Online-Betrug zu unterstützen, darunter Krypto-Scams und KI-basiertes Phishing. Die Factsheets enthalten praktische Beispiele und Warnsignale, mit denen sich betrügerische Nachrichten von echten Mitteilungen unterscheiden lassen, etwa unerwartete Anfragen nach persönlichen Daten oder unrealistisch attraktive Angebote.\n\n"
                   "Zudem werden zentrale Begriffe wie Phishing—der Versuch, sensible Daten durch Vortäuschung einer legitimen Identität zu erlangen—und Scam als gezielte Betrugsmasche zur Geldentwendung erklärt.",
        "locale": "de",
    },

    # Français
    {
        "title": "Les ESAs publient des conseils clés anti-fraude pour reconnaître et prévenir les arnaques en ligne",
        "slug": "esas-conseils-cles-anti-fraude-prevenir-arnaques-en-ligne",
        "excerpt": "Les Autorités européennes de surveillance ont publié de nouveaux factsheets destinés aux consommateurs pour détecter et prévenir les fraudes en ligne, y compris les escroqueries crypto et le phishing par IA.",
        "body_md": "**Source :** Autorité bancaire européenne (EBA), EIOPA, ESMA – eba.europa.eu\n"
                   "**Date de publication :** 15 décembre 2025\n"
                   "**Lien officiel :** https://www.eba.europa.eu/publications-and-media/press-releases/esas-publish-key-tips-help-consumers-detect-prevent-and-act-online-frauds-and-scams\n\n"
                   "**Résumé :** Les Autorités européennes de surveillance (EBA, EIOPA et ESMA) ont publié deux factsheets à destination des consommateurs afin de les aider à identifier, prévenir et réagir face aux fraudes en ligne, y compris les escroqueries liées aux cryptomonnaies et le phishing utilisant l’IA. Des exemples pratiques et des signaux d’alerte sont fournis pour distinguer les messages frauduleux des communications authentiques, tels que les demandes inattendues de données personnelles ou les offres trop avantageuses.\n\n"
                   "Les documents expliquent également des notions clés comme le phishing—tentatives d’obtention de données sensibles en se faisant passer pour une entité légitime—et les scams, conçus pour tromper les consommateurs et leur soutirer de l’argent.",
        "locale": "fr",
    },

    # Italiano
    {
        "title": "Consigli chiave anti-frode delle ESAs per riconoscere e prevenire le truffe online",
        "slug": "esas-consigli-chiave-anti-frode-riconoscere-prevenire-truffe-online",
        "excerpt": "Le Autorità europee di vigilanza hanno pubblicato nuovi factsheet per aiutare i consumatori a riconoscere, prevenire e affrontare frodi online, incluse crypto scam e phishing basato su AI.",
        "body_md": "**Fonte:** European Banking Authority (EBA), EIOPA, ESMA – eba.europa.eu\n"
                   "**Data di pubblicazione:** 15 dicembre 2025\n"
                   "**Link ufficiale:** https://www.eba.europa.eu/publications-and-media/press-releases/esas-publish-key-tips-help-consumers-detect-prevent-and-act-online-frauds-and-scams\n\n"
                   "**Riassunto:** Le Autorità europee di vigilanza (EBA, EIOPA e ESMA) hanno pubblicato due factsheet rivolti ai consumatori per aiutarli a identificare, prevenire e reagire a frodi online, incluse crypto scam e phishing basati su tecnologie di intelligenza artificiale. Vengono forniti esempi pratici e segnali d’allarme per distinguere messaggi fraudolenti da comunicazioni autentiche, come richieste inattese di dati personali o offerte troppo vantaggiose.\n\n"
                   "I factsheet spiegano inoltre termini chiave come phishing, ossia tentativi di ottenere dati sensibili fingendosi entità legittime, e scam, intese come truffe progettate per ingannare e sottrarre denaro.",
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