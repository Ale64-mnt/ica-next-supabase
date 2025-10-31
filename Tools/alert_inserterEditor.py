#!/usr/bin/env python3
"""
Programma Interattivo per Inserire Alert in Supabase - Versione Completa
"""

import requests
import json
import uuid
from datetime import datetime, timezone
import sys
import os
import tempfile
import subprocess

# Configurazione Supabase
SUPABASE_URL = "https://twwgfrbcndouazujgcma.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d2dmcmJjbmRvdWF6dWpnY21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMTI5MDcsImV4cCI6MjA3Mjc4ODkwN30.zAYybezGYlZMRO1QXifWV0nQw18aF9A7MGUE8EB1v3A"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def check_connection():
    """Verifica la connessione a Supabase"""
    try:
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/alert?select=id&limit=1",
            headers=headers
        )
        return response.status_code in [200, 201]
    except:
        return False

def get_content_from_editor(default_content=""):
    """
    Apre un editor esterno per scrivere il contenuto Markdown
    Mantiene la formattazione originale
    """
    print("\n📝 EDITOR MARKDOWN")
    print("-" * 40)
    print("Scegli come inserire il contenuto:")
    print("1. 🖋️  Apri VSCode (RACCOMANDATO)")
    print("2. 📋 Incolla direttamente nel terminale") 
    print("3. 📁 Carica da file .md esistente")
    
    choice = input("\nScelta [1]: ").strip() or "1"
    
    if choice == "1":
        content = open_external_editor(default_content)
    elif choice == "2":
        content = get_terminal_input(default_content)
    elif choice == "3":
        content = load_from_file()
    else:
        content = open_external_editor(default_content)
    
    return content or ""

def get_terminal_input(default_content=""):
    """Input multilinea dal terminale"""
    print("\n📝 Inserisci il contenuto Markdown:")
    print("   (Scrivi su più righe, due righe vuote per finire)")
    
    lines = []
    empty_lines = 0
    
    while True:
        try:
            line = input()
            if line.strip() == "":
                empty_lines += 1
                if empty_lines >= 2 and lines:
                    break
            else:
                empty_lines = 0
            lines.append(line)
        except EOFError:
            break
        except KeyboardInterrupt:
            print("\n❌ Inserimento annullato")
            return ""
    
    content = "\n".join(lines)
    print(f"📊 Contenuto inserito: {len(content)} caratteri")
    return content

def load_from_file():
    """Carica contenuto da un file .md esistente"""
    file_path = input("\n📁 Percorso del file .md: ").strip()
    
    if not file_path:
        return ""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"✅ File caricato: {len(content)} caratteri")
        return content
    except Exception as e:
        print(f"❌ Errore caricamento file: {e}")
        return ""

def open_external_editor(default_content=""):
    """Apre VSCode per editing Markdown"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(default_content or "")
        temp_file = f.name
    
    VSCODE_PATH = r"C:\Users\Alessandro\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"
    
    print("\n" + "=" * 60)
    print("🎯 EDITOR MARKDOWN - VISUAL STUDIO CODE")
    print("=" * 60)
    
    # Leggi il contenuto iniziale
    initial_content = ""
    try:
        with open(temp_file, 'r', encoding='utf-8') as f:
            initial_content = f.read()
    except:
        pass
    
    print("📝 ISTRUZIONI:")
    print("   1. VSCode si aprirà con un file temporaneo")
    print("   2. ✍️  SCRIVI il tuo contenuto Markdown")
    print("   3. 💾 SALVA (Ctrl+S) - IMPORTANTE!")
    print("   4. ❌ CHIUDI VSCode (Ctrl+W)")
    print("   5. 🎯 TORNA QUI e premi INVIO")
    print("=" * 60)
    
    input("\n🎯 Premi INVIO per aprire VSCode...")
    
    try:
        print("🚀 Apertura VSCode...")
        process = subprocess.Popen([VSCODE_PATH, temp_file])
        
        print("\n✅ VSCode aperto!")
        print("💡 Scrivi e salva il tuo contenuto, poi chiudi VSCode")
        print("⏳ Aspetto che tu chiuda VSCode e premi INVIO qui...")
        
        input("\n🎯 Dopo aver CHIUSO VSCode, premi INVIO per continuare...")
        
    except FileNotFoundError:
        print("❌ VSCode non trovato! Uso Blocco Note...")
        try:
            subprocess.Popen(['notepad', temp_file]).wait()
        except FileNotFoundError:
            print("❌ Nessun editor trovato")
            os.unlink(temp_file)
            return get_terminal_input(default_content)
    
    # Controlla se il file è stato modificato
    try:
        with open(temp_file, 'r', encoding='utf-8') as f:
            final_content = f.read()
        
        # Confronta con il contenuto iniziale
        if final_content == initial_content:
            print("❌ ATTENZIONE: Il file non è stato modificato!")
            print("💡 Forse non hai salvato in VSCode?")
            
            retry = input("   Vuoi riprovare? (s/n): ").strip().lower()
            if retry in ['s', 'si', 'y', 'yes']:
                return open_external_editor(default_content)
            else:
                return get_terminal_input(default_content)
        
        print(f"✅ Contenuto salvato: {len(final_content)} caratteri")
        return final_content
        
    except Exception as e:
        print(f"❌ Errore: {e}")
        return ""
    
    finally:
        # Pulisci sempre il file temporaneo
        try:
            os.unlink(temp_file)
        except:
            pass

def get_user_input():
    """Raccoglie l'input dall'utente per tutti i campi"""
    
    alert_data = {}
    
    print("\n📝 INSERISCI I DATI DELL'ALERT")
    print("-" * 40)
    
    # Titolo (obbligatorio)
    while True:
        title = input("Titolo dell'alert *: ").strip()
        if title:
            alert_data["title"] = title
            break
        print("❌ Il titolo è obbligatorio!")
    
    # Slug (obbligatorio)
    while True:
        slug = input("Slug/URL (senza spazi) *: ").strip()
        if slug:
            # Pulisce lo slug
            slug = slug.lower().replace(" ", "-").replace("_", "-")
            alert_data["slug"] = slug
            break
        print("❌ Lo slug è obbligatorio!")
    
    # Excerpt (opzionale)
    excerpt = input("Estratto/descrizione breve: ").strip()
    if excerpt:
        alert_data["excerpt"] = excerpt
    
    # Body MD con editor avanzato
    body_md = get_content_from_editor()
    if body_md.strip():
        alert_data["body_md"] = body_md
    
    # Image URL (opzionale)
    image_url = input("\n🖼️  URL immagine (opzionale): ").strip()
    if image_url:
        alert_data["image_url"] = image_url
        
        # Image Alt (se c'è l'URL immagine)
        image_alt = input("   Testo alternativo immagine: ").strip()
        if image_alt:
            alert_data["image_alt"] = image_alt
        
        # Thumb URL (opzionale - per homepage e liste)
        thumb_url = input("   🖼️  URL thumbnail (220x150px, opzionale): ").strip()
        if thumb_url:
            alert_data["thumb_url"] = thumb_url
        else:
            print("   💡 Thumbnail non inserita - usa image_url come fallback")
    
    # Related Article ID (opzionale)
    related_id = input("\n🔗 ID articolo correlato (UUID, opzionale): ").strip()
    if related_id:
        alert_data["related_article_id"] = related_id
    
    # Locale (opzionale)
    locale = input("🌐 Locale (es: it, en, fr): ").strip()
    if locale:
        alert_data["locale"] = locale
    
    # Published At (opzionale - con scelta)
    print("\n📅 Data di pubblicazione:")
    print("   1 - Ora attuale (default)")
    print("   2 - Data personalizzata (YYYY-MM-DD HH:MM)")
    print("   3 - Non pubblicare ora")
    
    pub_choice = input("   Scelta [1]: ").strip()
    
    if pub_choice == "2":
        date_str = input("   Data (YYYY-MM-DD HH:MM): ").strip()
        try:
            # Converte la data in formato ISO
            pub_date = datetime.strptime(date_str, "%Y-%m-%d %H:%M")
            pub_date = pub_date.replace(tzinfo=timezone.utc)
            alert_data["published_at"] = pub_date.isoformat()
        except ValueError:
            print("   ❌ Formato data non valido, uso ora attuale")
            alert_data["published_at"] = datetime.now(timezone.utc).isoformat()
    elif pub_choice == "3":
        # Non impostare published_at
        pass
    else:
        # Default: ora attuale
        alert_data["published_at"] = datetime.now(timezone.utc).isoformat()
    
    return alert_data

def insert_alert(alert_data):
    """Inserisce l'alert in Supabase"""
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/alert",
            headers=headers,
            json=alert_data
        )
        
        if response.status_code in [200, 201]:
            return True, response.json()
        else:
            return False, f"Errore {response.status_code}: {response.text}"
            
    except Exception as e:
        return False, f"Errore di connessione: {str(e)}"

def preview_alert(alert_data):
    """Mostra un'anteprima dell'alert"""
    print("\n" + "=" * 60)
    print("👁️  ANTEPRIMA ALERT")
    print("=" * 60)
    
    for key, value in alert_data.items():
        if value:
            display_value = str(value)
            if key == "body_md" and len(display_value) > 200:
                display_value = display_value[:200] + f"...\n[CONTENUTO TRONCATO - {len(value)} caratteri totali]"
            elif len(display_value) > 100:
                display_value = display_value[:100] + "..."
            print(f"  {key}: {display_value}")
    
    print("=" * 60)

def print_header():
    """Stampa l'intestazione del programa"""
    print("=" * 60)
    print("🎯 INSERITORE INTERATTIVO ALERT - SUPABASE")
    print("🐍 Python venv-ica ottimizzato con EDITOR ESTERNO")
    print("=" * 60)
    
    # Verifica connessione
    if check_connection():
        print("✅ Connessione Supabase: ATTIVA")
    else:
        print("❌ Connessione Supabase: ERRORE")
    
    print("\n📝 EDITOR SUPPORTATI: VSCode, Notepad++, Sublime, Vim, Nano")
    print("📊 Formattazione Markdown preservata")
    print("🖼️  Supporto per thumb_url (220x150px per homepage)")
    print("=" * 60)

def main():
    """Funzione principale del programma"""
    print_header()
    
    # Avviso se connessione non funziona
    if not check_connection():
        print("\n⚠️  ATTENZIONE: Problemi di connessione a Supabase")
        proceed = input("\n   Vuoi continuare comunque? (s/n): ").strip().lower()
        if proceed not in ['s', 'si', 'y', 'yes']:
            return
    
    while True:
        # Raccolta dati
        alert_data = get_user_input()
        
        # Anteprima
        preview_alert(alert_data)
        
        # Conferma
        confirm = input("\n✅ Confermi l'inserimento? (s/n): ").strip().lower()
        
        if confirm in ['s', 'si', 'y', 'yes']:
            # Inserimento
            print("\n🔄 Inserimento in corso...")
            success, result = insert_alert(alert_data)
            
            if success:
                print("🎉 ALERT INSERITO CON SUCCESSO!")
                if isinstance(result, list) and len(result) > 0:
                    alert = result[0]
                    print(f"   ID: {alert.get('id')}")
                    print(f"   Titolo: {alert.get('title')}")
                    print(f"   Slug: {alert.get('slug')}")
                    print(f"   Caratteri body: {len(alert.get('body_md', ''))}")
                    if alert.get('thumb_url'):
                        print(f"   ✅ Thumbnail: {alert.get('thumb_url')}")
                    elif alert.get('image_url'):
                        print(f"   ℹ️  Thumbnail: usa image_url come fallback")
            else:
                print(f"❌ ERRORE: {result}")
        
        # Nuovo inserimento?
        another = input("\n📝 Vuoi inserire un altro alert? (s/n): ").strip().lower()
        if another not in ['s', 'si', 'y', 'yes']:
            print("\n👋 Arrivederci!")
            break
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Programma interrotto. Arrivederci!")
    except Exception as e:
        print(f"\n❌ Errore imprevisto: {e}")