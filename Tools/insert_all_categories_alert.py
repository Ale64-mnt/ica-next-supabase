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
        
    # Deutsch
    {
        "title": "Festnahmen im Zusammenhang mit Betrug durch falsche „Worldline / Luxtrust“-Kontakte",
        "slug": "festnahmen-betrug-falsche-worldline-luxtrust-kontakte",
        "excerpt": "Die luxemburgische Polizei meldet Festnahmen im Rahmen eines Betrugs, bei dem Täter sich als Worldline- oder Luxtrust-Mitarbeiter ausgaben und Opfer zur Bestätigung betrügerischer Überweisungen verleiteten.",
        "body_md": "**Quelle:** Police Grand-Ducale – police.public.lu\n"
                   "**Veröffentlichungsdatum:** 24. Dezember 2025\n"
                   "**Offizieller Link:** https://police.public.lu/en/actualites.html\n\n"
                   "**Zusammenfassung:** Laut der offiziellen Mitteilung der Polizei des Großherzogtums Luxemburg wurde am 18. Dezember 2025 ein Betrugsfall gemeldet, bei dem eine Person von einem angeblichen Mitarbeiter von Worldline kontaktiert und dazu gebracht wurde, mehrere Überweisungen über die Luxtrust-App zu bestätigen. Die Ermittlungen führten zu zwei Festnahmen im Zusammenhang mit dieser Betrugsmasche.\n\n"
                   "**Praktische Vorgehensweise:** Die Täter geben sich als Vertreter von Zahlungsdienstleistern oder digitalen Vertrauensdiensten (z. B. Worldline, Luxtrust) aus und bringen die Opfer dazu, Überweisungen oder Freigaben über eigentlich legitime Apps zu bestätigen – jedoch auf Grundlage betrügerischer Anweisungen. In einem typischen Szenario erhält das Opfer einen scheinbar offiziellen Anruf mit dem Hinweis, das Konto sei kompromittiert und es müssten dringend „Sicherheits­transaktionen“ autorisiert werden. Tatsächlich werden so Geldtransfers auf von den Tätern kontrollierte Konten freigegeben.\n\n"
                   "**Was wir aus diesem Fall lernen: Money Mules und Social Engineering**\n\n"
                   "In diesem Fall nutzen die Täter nicht nur technische Mittel, sondern vor allem den menschlichen Faktor, indem sie Social-Engineering-Techniken einsetzen und sogenannte Money Mules einbinden.\n\n"
                   "Ein *Money Mule* ist eine Person, die ihr Bankkonto zur Verfügung stellt, um Geld aus illegalen Quellen entgegenzunehmen und weiterzuleiten oder abzuheben, oft gegen eine Provision. Auch ohne selbst den technischen Angriff durchgeführt zu haben, beteiligt sich ein Money Mule an der Geldwäsche und kann strafrechtlich verfolgt werden.\n\n"
                   "**Genutzte psychologische Hebel:**\n"
                   "- **Autorität:** Die Täter geben sich als Mitarbeiter vertrauenswürdiger Unternehmen (Worldline / Luxtrust) aus, um sofortiges Vertrauen zu erzeugen.\n"
                   "- **Asymmetrie der Informationen:** Es wird ausgenutzt, dass viele Nutzer die korrekten Abläufe von Banken und digitalen Identitätsdiensten nicht kennen.\n"
                   "- **Panik / Dringlichkeit:** Opfer werden unter Zeitdruck gesetzt („Ihr Konto ist in Gefahr, Sie müssen sofort handeln“), sodass keine gründliche Prüfung erfolgt.\n"
                   "- **Ökonomische Motivation:** Money Mules werden mit dem Versprechen „leichter Gewinne“ für die Nutzung ihres Kontos angeworben, insbesondere junge Menschen oder Personen in finanziellen Schwierigkeiten.\n\n"
                   "Dieser Fall zeigt, dass sich hinter Online-Betrug gezielte emotionale Manipulationen verbergen, die Vertrauen, Informationslücken und wirtschaftliche Bedürfnisse ausnutzen. Das Erkennen dieser Mechanismen ist ein zentraler Schritt, um weder Opfer noch – unwissentlich – Beteiligter zu werden.",
        "locale": "de",
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