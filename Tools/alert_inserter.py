#!/usr/bin/env python3
"""
Programma Interattivo per Inserire Alert in Supabase - Versione Ottimizzata
"""

import requests
import json
import uuid
from datetime import datetime, timezone
import sys
import os

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

def print_header():
    """Stampa l'intestazione del programma"""
    print("=" * 60)
    print("🎯 INSERITORE INTERATTIVO ALERT - SUPABASE")
    print("🐍 Python venv-ica ottimizzato")
    print("=" * 60)
    
    # Verifica connessione
    if check_connection():
        print("✅ Connessione Supabase: ATTIVA")
    else:
        print("❌ Connessione Supabase: ERRORE")
    
    print("\nCampi disponibili:")
    print("  • id (auto) • created_at (auto) • published_at")
    print("  • title (obbligatorio) • slug (obbligatorio)")
    print("  • excerpt • body_md • image_url • image_alt")
    print("  • related_article_id • locale")
    print("=" * 60)

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
    
    # Body MD (opzionale - con editor multilinea)
    print("\n💬 Contenuto principale (Markdown):")
    print("   (Scrivi il contenuto, due Enter per finire)")
    body_lines = []
    while True:
        try:
            line = input()
            if line == "" and body_lines and body_lines[-1] == "":
                break
            body_lines.append(line)
        except EOFError:
            break
    
    body_md = "\n".join(body_lines[:-1]) if len(body_lines) > 1 else ""
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
            if len(display_value) > 100:
                display_value = display_value[:100] + "..."
            print(f"  {key}: {display_value}")
    
    print("=" * 60)

def main():
    """Funzione principale del programma"""
    print_header()
    
    # Avviso se connessione non funziona
    if not check_connection():
        print("\n⚠️  ATTENZIONE: Problemi di connessione a Supabase")
        print("   Verifica:")
        print("   - Connessione internet")
        print("   - Credenziali Supabase")
        print("   - Tabella 'alert' esistente")
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
                    print(f"   Creato: {alert.get('created_at')}")
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