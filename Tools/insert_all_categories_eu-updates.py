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
        'title': "Simplifying digital rules to help European businesses grow",
        'slug': "simplifying-digital-rules-eu-businesses",
        'excerpt': "The Commission proposes measures to cut red tape for EU companies by simplifying rules on AI, cybersecurity and data, and creating a one-stop shop for security incident reporting.",
        'body_md': r"""
**Source:** European Commission (commission.europa.eu)  
**Publication date:** 19 November 2025  
**Official link:** https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en  

The European Commission has presented a package of measures to reduce administrative burdens for European businesses. The initiative simplifies rules on artificial intelligence, cybersecurity and data, and introduces a “one-stop shop” for reporting security incidents.

**Technical explanation:**  
“Cybersecurity incident-reporting” means that companies must report a hacking attack or a data breach — for example malware or ransomware.
""",
        'locale': 'en',
    },

    # Español
    {
        'title': "Simplificar las normas digitales para impulsar el crecimiento de las empresas europeas",
        'slug': "simplificar-normas-digitales-empresas-europeas",
        'excerpt': "La Comisión presenta medidas para reducir la carga administrativa de las empresas europeas, simplificando normas sobre IA, ciberseguridad y datos e introduciendo una ventanilla única para incidentes de seguridad.",
        'body_md': r"""
**Fuente:** Comisión Europea (commission.europa.eu)  
**Fecha de publicación:** 19 de noviembre de 2025  
**Enlace oficial:** https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en  

La Comisión ha presentado un paquete de medidas destinado a reducir los oneros administrativos para las empresas europeas, simplificando las normas sobre inteligencia artificial, ciberseguridad y datos e introduciendo una “ventanilla única” para la notificación de incidentes de seguridad.

**Explicación técnica:**  
“Cybersecurity incident-reporting” significa que las empresas deben comunicar un ataque informático o una violación de datos — por ejemplo, un malware o un ransomware.
""",
        'locale': 'es',
    },

    # Deutsch
    {
        'title': "Digitale Regeln vereinfachen, um europäische Unternehmen wachsen zu lassen",
        'slug': "digitale-regeln-vereinfachen-eu-unternehmen",
        'excerpt': "Die Kommission stellt Maßnahmen vor, um den Verwaltungsaufwand für europäische Unternehmen zu verringern, mit einfacheren Regeln zu KI, Cybersicherheit und Daten sowie einer zentralen Meldestelle für Sicherheitsvorfälle.",
        'body_md': r"""
**Quelle:** Europäische Kommission (commission.europa.eu)  
**Veröffentlichungsdatum:** 19. November 2025  
**Offizieller Link:** https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en  

Die Kommission hat ein Maßnahmenpaket vorgestellt, das darauf abzielt, den Verwaltungsaufwand für europäische Unternehmen zu verringern. Es vereinfacht die Vorschriften zu künstlicher Intelligenz, Cybersicherheit und Daten und führt eine „Einzelanlaufstelle“ für die Meldung von Sicherheitsvorfällen ein.

**Technische Erläuterung:**  
„Cybersecurity incident-reporting“ bedeutet, dass Unternehmen einen Hackerangriff oder eine Datenverletzung melden müssen — zum Beispiel einen Malware- oder Ransomware-Angriff.
""",
        'locale': 'de',
    },

    # Français
    {
        'title': "Simplifier les règles numériques pour favoriser la croissance des entreprises européennes",
        'slug': "simplifier-regles-numeriques-entreprises-europeennes",
        'excerpt': "La Commission présente un paquet de mesures pour réduire les charges administratives des entreprises européennes, en simplifiant les règles sur l’IA, la cybersécurité et les données, et en créant un guichet unique pour signaler les incidents de sécurité.",
        'body_md': r"""
**Source :** Commission européenne (commission.europa.eu)  
**Date de publication :** 19 novembre 2025  
**Lien officiel :** https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en  

La Commission a présenté un paquet de mesures visant à réduire les charges administratives pour les entreprises européennes, en simplifiant les règles relatives à l’intelligence artificielle, à la cybersécurité et aux données et en introduisant un « guichet unique » pour la déclaration des incidents de sécurité.

**Explication technique :**  
« Cybersecurity incident-reporting » signifie que les entreprises doivent signaler une attaque informatique ou une violation de données — par exemple un malware ou un ransomware.
""",
        'locale': 'fr',
    },

    # Italiano
    {
        'title': "Semplificare le regole digitali per far crescere le imprese europee",
        'slug': "semplificare-regole-digitali-imprese-europee",
        'excerpt': "La Commissione presenta un pacchetto di misure per ridurre gli oneri amministrativi delle imprese europee, semplificando le norme su IA, cybersicurezza e dati e introducendo uno sportello unico per segnalare gli incidenti di sicurezza.",
        'body_md': r"""
**Fonte:** Commissione europea (commission.europa.eu)  
**Data di pubblicazione:** 19 novembre 2025  
**Link ufficiale:** https://commission.europa.eu/news-and-media/news/simpler-digital-rules-help-eu-businesses-grow-2025-11-19_en  

La Commissione ha presentato un pacchetto di misure volte a ridurre i oneri amministrativi per le imprese europee, semplificando le norme su AI, cybersicurezza e dati e introducendo uno “sportello unico” per la segnalazione degli incidenti di sicurezza.

**Spiegazione tecnica:**  
“Cybersecurity incident-reporting” significa che le aziende devono comunicare un attacco hacker o una violazione dei dati — ad esempio un malware o un ransomware.
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