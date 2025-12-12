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
        "title": "ENISA – “NIS Investments 2025” report: changing cybersecurity investments in the EU",
        "slug": "enisa-nis-investments-2025-changing-cybersecurity-investments-eu",
        "excerpt": "ENISA’s new report shows a shift in EU cybersecurity spending from people to technology, driven by a skills shortage and regulations like NIS2, with effects on the prevention of online scams and financial fraud.",
        "body_md": "**Source:** ENISA – enisa.europa.eu\n"
                   "**Publication date:** 8 December 2025\n"
                   "**Link:** https://www.enisa.europa.eu/news/what-s-driving-cybersecurity-investments-and-where-lie-the-challenges-press-release-8-december-2025\n\n"
                   "**Summary:** The new report highlights how cybersecurity spending in the European Union is shifting its focus from people to technology, due to a shortage of specialised talent and the regulatory pressure of measures such as NIS2. This evolution also affects the ability to prevent digital scams, phishing and financial fraud through automated techniques.\n\n"
                   "**Practical context:** Lower investment in security awareness and training can leave users less prepared to recognise phishing, malware or fake brokers, increasing the risk of falling victim to scams.",
        "locale": "en",
    },

    # Español
    {
        "title": "ENISA – informe «NIS Investments 2025»: cambio en las inversiones en ciberseguridad en la UE",
        "slug": "enisa-nis-investments-2025-cambio-inversiones-ciberseguridad-ue",
        "excerpt": "El nuevo informe de ENISA muestra que el gasto en ciberseguridad en la UE se desplaza de las personas hacia la tecnología, por la falta de talento especializado y la presión regulatoria de normas como NIS2.",
        "body_md": "**Fuente:** ENISA – enisa.europa.eu\n"
                   "**Fecha de publicación:** 8 de diciembre de 2025\n"
                   "**Enlace:** https://www.enisa.europa.eu/news/what-s-driving-cybersecurity-investments-and-where-lie-the-challenges-press-release-8-december-2025\n\n"
                   "**Resumen:** El nuevo informe pone de relieve que en el gasto de ciberseguridad en la Unión Europea la atención se está desplazando de las personas a la tecnología, debido a la escasez de talento especializado y a la presión regulatoria de medidas como NIS2. Esta evolución también influye en la capacidad de prevenir estafas digitales, phishing y fraudes financieros mediante técnicas automatizadas.\n\n"
                   "**Contexto práctico:** Una menor inversión en concienciación y formación en ciberseguridad puede hacer que los usuarios estén menos preparados para reconocer phishing, malware o falsos brókeres, aumentando el riesgo de caer en estafas.",
        "locale": "es",
    },

    # Deutsch
    {
        "title": "ENISA – Bericht „NIS Investments 2025“: Wandel der Cybersecurity-Investitionen in der EU",
        "slug": "enisa-nis-investments-2025-wandel-cybersecurity-investitionen-eu",
        "excerpt": "Laut ENISAs neuem Bericht verlagern sich die Cybersicherheitsausgaben in der EU von Menschen hin zu Technologie – getrieben durch Fachkräftemangel und Vorgaben wie NIS2.",
        "body_md": "**Quelle:** ENISA – enisa.europa.eu\n"
                   "**Veröffentlichungsdatum:** 8. Dezember 2025\n"
                   "**Link:** https://www.enisa.europa.eu/news/what-s-driving-cybersecurity-investments-and-where-lie-the-challenges-press-release-8-december-2025\n\n"
                   "**Zusammenfassung:** Der neue Bericht zeigt, dass sich die Ausgaben für Cybersicherheit in der Europäischen Union von den Menschen hin zur Technologie verlagern. Gründe sind der Mangel an spezialisiertem Personal sowie der Regulierungsdruck durch Maßnahmen wie NIS2. Diese Entwicklung beeinflusst auch die Fähigkeit, digitale Betrugsmaschen, Phishing und Finanzbetrug mit automatisierten Techniken zu verhindern.\n\n"
                   "**Praktischer Kontext:** Geringere Investitionen in Sensibilisierung und Schulung können dazu führen, dass Nutzer weniger gut in der Lage sind, Phishing, Malware oder Fake-Broker zu erkennen – und so leichter auf Betrügereien hereinfallen.",
        "locale": "de",
    },

    # Français
    {
        "title": "ENISA – rapport « NIS Investments 2025 » : évolution des investissements en cybersécurité dans l’UE",
        "slug": "enisa-nis-investments-2025-evolution-investissements-cybersecurite-ue",
        "excerpt": "Le nouveau rapport d’ENISA montre un déplacement des dépenses de cybersécurité dans l’UE, des personnes vers la technologie, sous l’effet de la pénurie de talents et de la pression réglementaire de NIS2.",
        "body_md": "**Source :** ENISA – enisa.europa.eu\n"
                   "**Date de publication :** 8 décembre 2025\n"
                   "**Lien :** https://www.enisa.europa.eu/news/what-s-driving-cybersecurity-investments-and-where-lie-the-challenges-press-release-8-december-2025\n\n"
                   "**Résumé :** Le nouveau rapport met en évidence qu’en matière de dépenses de cybersécurité dans l’Union européenne, l’accent se déplace des personnes vers la technologie, en raison du manque de talents spécialisés et de la pression réglementaire de mesures telles que NIS2. Cette évolution a également un impact sur la capacité à prévenir les arnaques en ligne, le phishing et la fraude financière au moyen de techniques automatisées.\n\n"
                   "**Contexte pratique :** Une baisse des investissements dans la sensibilisation et la formation peut laisser les utilisateurs moins préparés à reconnaître le phishing, les malwares ou les faux courtiers, ce qui augmente le risque de tomber dans des escroqueries.",
        "locale": "fr",
    },

    # Italiano
    {
        "title": "ENISA – report «NIS Investments 2025»: cambiamento degli investimenti in cybersecurity nell’UE",
        "slug": "enisa-nis-investments-2025-cambiamento-investimenti-cybersecurity-ue",
        "excerpt": "Il nuovo report ENISA mostra che nella spesa per cybersecurity nell’UE l’enfasi si sposta dalle persone alla tecnologia, anche per effetto della carenza di talenti e delle regole NIS2.",
        "body_md": "**Fonte:** ENISA – enisa.europa.eu\n"
                   "**Data di pubblicazione:** 8 dicembre 2025\n"
                   "**Link:** https://www.enisa.europa.eu/news/what-s-driving-cybersecurity-investments-and-where-lie-the-challenges-press-release-8-december-2025\n\n"
                   "**Riassunto:** Il nuovo report evidenzia come nelle spese per cybersecurity nell’Unione Europea si stia spostando l’enfasi dalle persone alla tecnologia, a causa della carenza di talenti specializzati e della pressione normativa di misure come NIS2. Tale evoluzione influenza anche la capacità di prevenire truffe digitali, phishing e frodi finanziarie tramite tecniche automatizzate.\n\n"
                   "**Contesto pratico:** Un minore investimento in “awareness” e formazione può rendere gli utenti meno preparati a riconoscere phishing, malware o fake-broker, aumentando il rischio di cadere in truffe.",
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