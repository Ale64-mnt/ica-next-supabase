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
     # English
    {
        "title": "Europol: €700 million cryptocurrency fraud network dismantled",
        "slug": "europol-700-million-cryptocurrency-fraud-network-dismantled",
        "excerpt": "European authorities have taken down a criminal network behind fake crypto investment platforms said to have collected around €700 million from victims.",
        "body_md": "**Source:** Europol – europol.europa.eu\n"
                   "**Publication date:** 4 December 2025\n"
                   "**Link:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network\n\n"
                   "**Summary:** European authorities carried out a joint operation that dismantled a criminal network responsible for fake crypto investment platforms that allegedly gathered around €700 million. Numerous fraudulent websites promised high returns and targeted victims across multiple European jurisdictions.\n\n"
                   "**How the scam works:** Users were lured through misleading ads or social media outreach and convinced—through promises of easy profits—to deposit money on fake investment portals. After initial deposits, victims were asked for additional payments or “release fees” to withdraw funds, but access was then blocked.",
        "locale": "en",
    },

    # Español
    {
        "title": "Europol: desmantelada una red de fraude cripto de 700 millones de euros",
        "slug": "europol-desmantela-red-fraude-cripto-700-millones",
        "excerpt": "Las autoridades europeas han desmantelado una red criminal responsable de plataformas falsas de inversión en criptomonedas que habrían recaudado unos 700 millones de euros.",
        "body_md": "**Fuente:** Europol – europol.europa.eu\n"
                   "**Fecha de publicación:** 4 de diciembre de 2025\n"
                   "**Enlace:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network\n\n"
                   "**Resumen:** Las autoridades europeas llevaron a cabo una operación conjunta que permitió desmantelar una red criminal vinculada a plataformas de inversión cripto fraudulentas que habrían recaudado alrededor de 700 millones de euros. Numerosos sitios falsos prometían altos rendimientos y captaban víctimas en varias jurisdicciones europeas.\n\n"
                   "**Cómo funciona la estafa:** Los usuarios eran atraídos mediante publicidad engañosa o redes sociales y convencidos—con promesas de beneficios fáciles—para depositar dinero en portales de inversión falsos. Tras un primer depósito, se solicitaban pagos adicionales o “tasas de liberación”, pero el acceso a la cuenta era bloqueado.",
        "locale": "es",
    },

    # Deutsch
    {
        "title": "Europol: Krypto-Betrugsnetzwerk über 700 Millionen Euro zerschlagen",
        "slug": "europol-krypto-betrugsnetzwerk-700-millionen-zerschlagen",
        "excerpt": "Europäische Behörden haben ein kriminelles Netzwerk zerschlagen, das hinter gefälschten Krypto-Investitionsplattformen stand und rund 700 Millionen Euro erbeutet haben soll.",
        "body_md": "**Quelle:** Europol – europol.europa.eu\n"
                   "**Veröffentlichungsdatum:** 4. Dezember 2025\n"
                   "**Link:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network\n\n"
                   "**Zusammenfassung:** Europäische Behörden führten eine gemeinsame Operation durch, bei der ein kriminelles Netzwerk zerschlagen wurde, das für gefälschte Krypto-Investitionsplattformen verantwortlich war und angeblich rund 700 Millionen Euro eingenommen hat. Zahlreiche betrügerische Websites versprachen hohe Renditen und lockten Opfer in verschiedenen europäischen Ländern.\n\n"
                   "**So funktioniert die Masche:** Nutzer wurden über irreführende Werbung oder soziale Medien geködert und mit Versprechen schneller Gewinne dazu gebracht, Geld auf gefälschten Investitionsportalen einzuzahlen. Nach der ersten Einzahlung wurden weitere Zahlungen oder “Freigabegebühren” verlangt, während der Kontozugang blockiert wurde.",
        "locale": "de",
    },

    # Français
    {
        "title": "Europol : démantèlement d’un réseau d’escroquerie crypto de 700 millions d’euros",
        "slug": "europol-demantele-reseau-escroquerie-crypto-700-millions",
        "excerpt": "Les autorités européennes ont démantelé un réseau criminel à l’origine de fausses plateformes d’investissement crypto ayant collecté environ 700 millions d’euros.",
        "body_md": "**Source :** Europol – europol.europa.eu\n"
                   "**Date de publication :** 4 décembre 2025\n"
                   "**Lien :** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network\n\n"
                   "**Résumé :** Les autorités européennes ont conduit une opération conjointe ayant permis de démanteler un réseau criminel responsable de fausses plateformes d’investissement en cryptomonnaies, lesquelles auraient collecté près de 700 millions d’euros. De nombreux sites frauduleux promettaient des rendements élevés et piégeaient des victimes dans plusieurs juridictions européennes.\n\n"
                   "**Mécanisme de l’arnaque :** Les utilisateurs étaient attirés par des publicités trompeuses ou les réseaux sociaux, puis convaincus—grâce à des promesses de gains faciles—de déposer de l’argent sur des portails d’investissement frauduleux. Après un premier dépôt, des versements supplémentaires ou des “frais de déblocage” étaient exigés, tandis que l’accès au compte était bloqué.",
        "locale": "fr",
    },

    # Italiano
    {
        "title": "Europol: smantellata rete di frode cripto da 700 milioni €",
        "slug": "europol-smantellata-rete-frode-cripto-700-milioni",
        "excerpt": "Operazione congiunta delle autorità europee che ha portato allo smantellamento di una rete criminale responsabile di piattaforme d’investimento cripto fasulle per circa 700 milioni di euro.",
        "body_md": "**Fonte:** Europol – europol.europa.eu\n"
                   "**Data di pubblicazione:** 4 dicembre 2025\n"
                   "**Link:** https://www.europol.europa.eu/media-press/newsroom/news/international-takedown-of-cryptocurrency-fraud-network\n\n"
                   "**Riassunto:** Le autorità europee hanno condotto un’operazione congiunta che ha portato allo smantellamento di una rete criminale responsabile di piattaforme d’investimento cripto fasulle che avrebbero raccolto circa 700 milioni di euro. Numerosi siti fraudolenti promettevano rendimenti elevati e attiravano vittime in diverse giurisdizioni europee.\n\n"
                   "**Meccanismo della truffa:** Gli utenti venivano agganciati tramite pubblicità ingannevoli o social media e convinti—con promesse di profitti facili—a versare denaro su portali d’investimento fasulli. Dopo i primi depositi, venivano richiesti ulteriori pagamenti o “tasse di sblocco” per poter prelevare, ma l’accesso veniva bloccato.",
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