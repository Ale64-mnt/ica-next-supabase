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
    'title': "Education Policy Outlook 2025: nurturing lifelong learners",
    'slug': "education-policy-outlook-2025-nurturing-lifelong-learners",
    'excerpt': "The OECD compares education policies in 35 systems and presents the will–skills–means model to support lifelong learning across key life stages.",
    'body_md': r"""
**Source:** OECD – oecd.org  
**Publication date:** 28 November 2025  
**Official link:** https://www.oecd.org/en/publications/education-policy-outlook-2025_c3f402ba-en.html  

The report presents a comparative overview of education policies in 35 systems to support lifelong learning in a context marked by digital transformation, population ageing and growing inequalities. The OECD introduces the “will–skills–means” model to describe what people need to become lifelong learners: motivation and well-being (will), basic and digital skills (skills), and resources, opportunities and flexible learning pathways (means).  

The document identifies four critical moments in life — early childhood, adolescence, mid-working life and the approach to retirement — where targeted policies can have lasting effects on people’s ability to keep learning. The central message is that, despite many formal commitments, effective access to continuous learning opportunities remains unequal and often fragmented, and requires greater coherence of education policies across the life course.
""",
    'locale': 'en',
},

# Español
{
    'title': "Perspectivas de las políticas educativas 2025: cultivar aprendices a lo largo de toda la vida",
    'slug': "perspectivas-politicas-educativas-2025-aprendizaje-vida",
    'excerpt': "El informe de la OCDE compara políticas educativas en 35 sistemas y describe el modelo voluntad–competencias–medios para favorecer el aprendizaje permanente.",
    'body_md': r"""
**Fuente:** OCDE – oecd.org  
**Fecha de publicación:** 28 de noviembre de 2025  
**Enlace oficial:** https://www.oecd.org/en/publications/education-policy-outlook-2025_c3f402ba-en.html  

El informe presenta un panorama comparado de políticas educativas en 35 sistemas para apoyar el aprendizaje a lo largo de toda la vida en un contexto marcado por la transformación digital, el envejecimiento demográfico y el aumento de las desigualdades. La OCDE introduce el modelo “voluntad–competencias–medios (will–skills–means)” para describir lo que necesitan las personas para convertirse en aprendices permanentes: motivación y bienestar (voluntad), competencias básicas y digitales (competencias), recursos, oportunidades y trayectorias formativas flexibles (medios).  

El documento identifica cuatro momentos críticos de la vida — primera infancia, adolescencia, mitad de la vida laboral y acercamiento a la jubilación — en los que políticas específicas pueden tener efectos duraderos sobre la capacidad de las personas para seguir aprendiendo. El mensaje central es que, a pesar de numerosos compromisos formales, el acceso efectivo a oportunidades de aprendizaje continuo sigue siendo desigual y a menudo fragmentado, y requiere una mayor coherencia de las políticas educativas a lo largo de todo el ciclo de vida.
""",
    'locale': 'es',
},

# Deutsch
{
    'title': "Bildungspolitische Perspektiven 2025: Lernende über die gesamte Lebensspanne fördern",
    'slug': "bildungspolitische-perspektiven-2025-lernende-lebensspanne",
    'excerpt': "Der OECD-Bericht vergleicht Bildungspolitiken in 35 Systemen und stellt das Modell Wille–Kompetenzen–Mittel für lebenslanges Lernen vor.",
    'body_md': r"""
**Quelle:** OECD – oecd.org  
**Veröffentlichungsdatum:** 28. November 2025  
**Offizieller Link:** https://www.oecd.org/en/publications/education-policy-outlook-2025_c3f402ba-en.html  

Der Bericht bietet einen vergleichenden Überblick über Bildungspolitiken in 35 Systemen, die das Lernen über die gesamte Lebensspanne in einem Umfeld unterstützen sollen, das von digitalem Wandel, demografischer Alterung und wachsenden Ungleichheiten geprägt ist. Die OECD führt das Modell „Wille–Kompetenzen–Mittel (will–skills–means)“ ein, um zu beschreiben, was Menschen brauchen, um lebenslange Lernende zu werden: Motivation und Wohlbefinden (Wille), grundlegende und digitale Kompetenzen (Kompetenzen) sowie Ressourcen, Chancen und flexible Bildungswege (Mittel).  

Das Dokument benennt vier kritische Lebensphasen — frühe Kindheit, Jugendalter, mittlere Erwerbsphase und Übergang in den Ruhestand — in denen gezielte Politiken dauerhafte Wirkungen auf die Fähigkeit der Menschen haben können, weiterzulernen. Die zentrale Botschaft lautet, dass trotz vieler formaler Verpflichtungen der tatsächliche Zugang zu kontinuierlichen Lernmöglichkeiten ungleich und oft fragmentiert bleibt und eine größere Kohärenz der Bildungspolitik über den gesamten Lebensverlauf erfordert.
""",
    'locale': 'de',
},

# Français
{
    'title': "Perspectives des politiques de l’éducation 2025 : cultiver des apprenants tout au long de la vie",
    'slug': "perspectives-politiques-education-2025-apprenants-vie",
    'excerpt': "Le rapport de l’OCDE compare les politiques éducatives de 35 systèmes et présente le modèle volonté–compétences–moyens pour soutenir l’apprentissage tout au long de la vie.",
    'body_md': r"""
**Source :** OCDE – oecd.org  
**Date de publication :** 28 novembre 2025  
**Lien officiel :** https://www.oecd.org/en/publications/education-policy-outlook-2025_c3f402ba-en.html  

Le rapport présente un cadre comparatif des politiques éducatives de 35 systèmes visant à soutenir l’apprentissage tout au long de la vie dans un contexte marqué par la transformation numérique, le vieillissement démographique et l’augmentation des inégalités. L’OCDE introduit le modèle « volonté–compétences–moyens (will–skills–means) » pour décrire ce dont les personnes ont besoin pour devenir des apprenants tout au long de la vie : motivation et bien-être (volonté), compétences de base et numériques (compétences), ressources, opportunités et parcours de formation flexibles (moyens).  

Le document identifie quatre moments critiques de la vie — petite enfance, adolescence, milieu de carrière et approche de la retraite — où des politiques ciblées peuvent avoir des effets durables sur la capacité des personnes à continuer d’apprendre. Le message central est que, malgré de nombreux engagements formels, l’accès effectif à des opportunités d’apprentissage continu reste inégal et souvent fragmenté et qu’il nécessite une plus grande cohérence des politiques éducatives sur l’ensemble du cycle de vie.
""",
    'locale': 'fr',
},

# Italiano
{
    'title': "Prospettive delle politiche dell’istruzione 2025: coltivare discenti lungo tutto l’arco della vita",
    'slug': "prospettive-politiche-istruzione-2025-discenti-tutta-vita",
    'excerpt': "L’OCSE analizza le politiche educative di 35 sistemi e propone il modello volontà–competenze–mezzi per sostenere l’apprendimento permanente nei momenti chiave della vita.",
    'body_md': r"""
**Fonte:** OECD – oecd.org  
**Data di pubblicazione:** 28 novembre 2025  
**Link ufficiale:** https://www.oecd.org/en/publications/education-policy-outlook-2025_c3f402ba-en.html  

Il rapporto presenta un quadro comparato di politiche educative in 35 sistemi per sostenere l’apprendimento lungo tutto l’arco della vita in un contesto segnato da trasformazione digitale, invecchiamento demografico e disuguaglianze crescenti. L’OCSE introduce il modello “volontà–competenze–mezzi (will–skills–means)” per descrivere ciò che serve alle persone per diventare discenti lungo tutto l’arco della vita (lifelong learners): motivazione e benessere (volontà), competenze di base e digitali (competenze), risorse, opportunità e percorsi flessibili di formazione (mezzi).  

Il documento individua quattro momenti critici della vita – prima infanzia, adolescenza, mezza età lavorativa e avvicinamento alla pensione – in cui politiche mirate possono avere effetti duraturi sulla capacità delle persone di continuare a imparare. Il messaggio centrale è che, nonostante molti impegni formali, l’accesso effettivo a opportunità di apprendimento continuo resta diseguale e spesso frammentato, e richiede una maggiore coerenza delle politiche educative lungo tutto il ciclo di vita.
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