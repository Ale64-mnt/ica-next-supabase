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
IMAGE_URL = "https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/Alert/news/alert_symbol_full.png"
THUMB_URL = "https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/Alert/news/alert_symbol_thum.png"

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
        'title': 'Truffa ESMA - Guida alla Sicurezza',
        'slug': 'truffa-esma',
        'excerpt': 'Come riconoscere le truffe che utilizzano il nome e il logo dell ESMA',
        'body_md': '''**In breve**
I truffatori possono usare nome e logo ESMA, numeri di telefono, email e siti molto simili a quelli ufficiali. Possono spacciarsi per funzionari ESMA, inviare documenti/certificati falsi o clonare il sito ESMA per indurti a pagare o condividere dati.

**Come riconoscere una truffa**

- Arriva inaspettata (email, telefonata, SMS, social) ed è "troppo bella per essere vera"
- Chiede dati personali o ti invita a trasferire denaro (es. "tassa amministrativa")
- Dice di agire per recuperare fondi o "indagare" su un intermediario, chiedendo un pagamento
- Mostra logo ESMA e riferimenti "ufficiali", ma i contenuti contengono errori o link sospetti

**Importante:** ESMA non ti contatterà mai per chiedere dati personali o pagamenti''',
        'locale': 'it'
    },
    # English
    {
        'title': 'OLAF Scam Alert – What Citizens Should Do',
        'slug': 'olaf-scam-alert-what-citizens-should-do',
        'excerpt': 'How to spot and respond to emails, letters and calls that impersonate OLAF.',
        'body_md': '''# **Beware of hoax emails, letters and scam phone calls claiming to be from OLAF**

## **At a glance**
Fraudsters use the **name and logo of the European Commission/OLAF** and sometimes the **identity of officials** to look credible. They promise money transfers **only if you pay a "fee"** and **provide personal/financial data**. They often re-contact people **who were already scammed**, quoting the **exact amount lost**: this is **another scam**.

## **What it means for citizens**
* If you receive requests that **appear** to come from OLAF or its staff, it's **a scam**.  
* **OLAF does not offer or request money transfers** to/from citizens and **does not recover** amounts lost in past scams.  
* OLAF investigates **fraud affecting the EU budget** and **suspected misconduct** by EU staff; **not** personal finances or **cryptocurrencies**.

## **What to do now**
* **Do not reply**, **do not click** links and **do not open** attachments.  
* **Do not share** personal or banking data; **do not pay** any fees.  
* **Keep evidence**: screenshots, full links/URLs, sender email or caller number.  
* **Report** the fraud/phishing attempt to your **national competent authorities** for crime and/or cybercrime.  
* If you already paid or shared data: **contact your bank** and **file a police report**.

## **Red flags to recognise fakes**
* **Suspicious bank accounts**, **inaccurate logos**, **wrong email addresses** or **fake websites**.  
* Genuine Commission/OLAF emails end with `@ec.europa.eu`.  
* **Official OLAF website**: `https://anti-fraud.ec.europa.eu/index_en` (always check the exact URL).

> **Remember:** OLAF investigators **do not call or email citizens** to **ask for or offer money**.

---

**Source (OLAF – European Anti-Fraud Office)**: <https://anti-fraud.ec.europa.eu/index_en>''',
        'locale': 'en'
    },

    # Español
    {
        'title': 'Alerta OLAF – Qué deben hacer los ciudadanos',
        'slug': 'alerta-olaf-que-deben-hacer-los-ciudadanos',
        'excerpt': 'Cómo detectar y responder a correos, cartas y llamadas que suplantan a OLAF.',
        'body_md': '''# **Atención a correos, cartas y llamadas fraudulentas que dicen ser de OLAF**

## **En breve**
Los estafadores usan el **nombre y el logotipo de la Comisión Europea/OLAF** y, a veces, la **identidad de funcionarios** para parecer creíbles. Prometen transferencias de dinero **solo si pagas una "tasa"** y **facilitas datos personales/financieros**. A menudo vuelven a contactar a **quienes ya fueron estafados**, citando el **importe exacto perdido**: es **otra estafa**.

## **Qué significa para los ciudadanos**
* Si recibes solicitudes que **parecen** proceder de OLAF o de su personal, es **una estafa**.  
* **OLAF no ofrece ni solicita transferencias de dinero** a/desde ciudadanos y **no recupera** importes perdidos en estafas anteriores.  
* OLAF investiga **fraudes que afectan al presupuesto de la UE** y **sospechas de mala conducta** del personal de la UE; **no** finanzas personales ni **criptomonedas**.

## **Qué hacer ahora**
* **No respondas**, **no hagas clic** en enlaces y **no abras** adjuntos.  
* **No compartas** datos personales o bancarios; **no pagues** comisiones.  
* **Guarda pruebas**: capturas, enlaces/URLs completos, email del remitente o número llamante.  
* **Denuncia** el intento de fraude/phishing ante las **autoridades nacionales competentes** en materia penal y/o ciberdelincuencia.  
* Si ya pagaste o compartiste datos: **contacta con tu banco** y **presenta denuncia**.

## **Señales para reconocer falsificaciones**
* **Cuentas bancarias sospechosas**, **logotipos inexactos**, **emails incorrectos** o **sitios web falsos**.  
* Los correos genuinos de la Comisión/OLAF terminan en `@ec.europa.eu`.  
* **Sitio oficial de OLAF**: `https://anti-fraud.ec.europa.eu/index_en` (verifica siempre la URL exacta).

> **Recuerda:** los investigadores de OLAF **no llaman ni escriben a los ciudadanos** para **pedir u ofrecer dinero**.

---

**Fuente (OLAF – Oficina Europea de Lucha contra el Fraude)**: <https://anti-fraud.ec.europa.eu/index_en>''',
        'locale': 'es'
    },

    # Deutsch
    {
        'title': 'OLAF-Betrugswarnung – Was Bürger tun sollten',
        'slug': 'olaf-betrugswarnung-was-buerger-tun-sollten',
        'excerpt': 'So erkennen und reagieren Sie auf E-Mails, Briefe und Anrufe, die OLAF vortäuschen.',
        'body_md': '''# **Achtung vor gefälschten E-Mails, Briefen und Anrufen im Namen von OLAF**

## **Auf einen Blick**
Betrüger nutzen **Name und Logo der Europäischen Kommission/OLAF** und mitunter die **Identität von Bediensteten**, um glaubwürdig zu wirken. Sie versprechen Geldüberweisungen **nur gegen Zahlung einer "Gebühr"** und fordern **persönliche/finanzielle Daten**. Häufig kontaktieren sie **bereits Betroffene** erneut und nennen den **exakt verlorenen Betrag**: das ist **ein weiterer Betrug**.

## **Was das für Bürger bedeutet**
* Wenn Sie Anfragen erhalten, die **scheinbar** von OLAF oder dessen Mitarbeitenden stammen, ist es **Betrug**.  
* **OLAF bietet oder verlangt keine Geldtransfers** an/von Bürgern und **holt** keine in der Vergangenheit verlorenen Gelder **zurück**.  
* OLAF ermittelt zu **Betrug zulasten des EU-Haushalts** und **mutmaßlichem Fehlverhalten** von EU-Bediensteten; **nicht** zu privaten Finanzen oder **Kryptowährungen**.

## **Was ist jetzt zu tun**
* **Nicht antworten**, **keine Links anklicken**, **keine Anhänge öffnen**.  
* **Keine** persönlichen oder Bankdaten **weitergeben**; **keine Gebühren** zahlen.  
* **Beweise sichern**: Screenshots, vollständige Links/URLs, Absender-E-Mail oder Rufnummer.  
* **Melden** Sie den Betrugs-/Phishingversuch den **zuständigen nationalen Behörden** für Straf- und/oder Cyberkriminalität.  
* Wenn Sie bereits gezahlt oder Daten weitergegeben haben: **Bank kontaktieren** und **Anzeige erstatten**.

## **Warnzeichen für Fälschungen**
* **Verdächtige Bankkonten**, **ungenaue Logos**, **falsche E-Mail-Adressen** oder **gefälschte Websites**.  
* Echte E-Mails der Kommission/OLAF enden auf `@ec.europa.eu`.  
* **Offizielle OLAF-Website**: `https://anti-fraud.ec.europa.eu/index_en` (prüfen Sie stets die exakte URL).

> **Merken Sie sich:** OLAF-Ermittler **rufen Bürger nicht an und schreiben sie nicht an**, um **Geld zu verlangen oder anzubieten**.

---

**Quelle (OLAF – Europäisches Amt für Betrugsbekämpfung)**: <https://anti-fraud.ec.europa.eu/index_en>''',
        'locale': 'de'
    },

    # Français
    {
        'title': 'Alerte OLAF – Que doivent faire les citoyens',
        'slug': 'alerte-olaf-que-doivent-faire-les-citoyens',
        'excerpt': 'Comment repérer et réagir face aux e-mails, lettres et appels usurpant l\'OLAF.',
        'body_md': '''# **Attention aux e-mails, lettres et appels frauduleux prétendant venir de l'OLAF**

## **En bref**
Des fraudeurs utilisent le **nom et le logo de la Commission européenne/de l'OLAF** et parfois l'**identité d'agents** pour paraître crédibles. Ils promettent des virements **seulement si vous payez des "frais"** et **fournissez des données personnelles/financières**. Ils recontactent souvent **des victimes antérieures**, en citant le **montant exact perdu** : c'est **une autre arnaque**.

## **Ce que cela signifie pour les citoyens**
* Si vous recevez des demandes qui **semblent** provenir de l'OLAF ou de ses agents, c'est **une arnaque**.  
* **L'OLAF n'offre ni ne demande de transferts d'argent** aux citoyens et **ne récupère pas** les sommes perdues lors d'arnaques passées.  
* L'OLAF enquête sur les **fraudes portant atteinte au budget de l'UE** et les **soupçons de mauvaise conduite** du personnel de l'UE ; **pas** sur les finances personnelles ni les **cryptomonnaies**.

## **Que faire maintenant**
* **Ne répondez pas**, **ne cliquez pas** sur les liens et **n'ouvrez pas** les pièces jointes.  
* **Ne communiquez pas** de données personnelles ou bancaires ; **ne payez** aucun frais.  
* **Conservez des preuves** : captures d'écran, liens/URL complets, e-mail de l'expéditeur ou numéro appelant.  
* **Signalez** la tentative de fraude/hameçonnage aux **autorités nationales compétentes** en matière pénale et/ou de cybercriminalité.  
* Si vous avez déjà payé ou transmis des données : **contactez votre banco** et **déposez plainte**.

## **Signaux pour reconnaître les faux**
* **Comptes bancaires suspects**, **logos imprécis**, **adresses e-mail erronées** ou **sites web factices**.  
* Les e-mails authentiques de la Commission/de l'OLAF se terminent par `@ec.europa.eu`.  
* **Site officiel de l'OLAF** : `https://anti-fraud.ec.europa.eu/index_en` (vérifiez toujours l'URL exacte).

> **À retenir :** les enquêteurs de l'OLAF **n'appellent ni n'écrivent aux citoyens** pour **demander ou offrir de l'argent**.

---

**Source (OLAF – Office européen de lutte antifraude)**: <https://anti-fraud.ec.europa.eu/index_en>''',
        'locale': 'fr'
    }
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