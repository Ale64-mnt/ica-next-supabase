import os
from dotenv import load_dotenv
from pathlib import Path
import psycopg2

print(" TEST CON FORMATO .env CORRETTO")
print("=" * 40)

# Carica variabili con dotenv
project_root = Path(__file__).parent.parent
load_dotenv(project_root / '.env.db')

# Leggi la variabile
db_url = os.getenv('SUPABASE_DB_URL')

print(f"File .env.db caricato: {project_root / '.env.db'}")
print(f"SUPABASE_DB_URL trovata: {'✅' if db_url else '❌'}")

if db_url:
    print(f"Stringa: {db_url[:80]}...")
    
    # Test connessione
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(" CONNESSIONE DATABASE RIUSCITA!")
        print(f" PostgreSQL: {version[0]}")
        
        # Test dati articoli
        cursor.execute('SELECT COUNT(*) FROM articles;')
        count = cursor.fetchone()[0]
        print(f" Articoli nel database: {count}")
        
        # Mostra alcuni articoli
        cursor.execute('SELECT lang, slug, title FROM articles LIMIT 3;')
        articles = cursor.fetchall()
        print(f"\n PRIMI 3 ARTICOLI:")
        for article in articles:
            print(f"   [{article[0]}] {article[1]} - {article[2][:30]}...")
        
        cursor.close()
        conn.close()
        
        print(f"\n COLLEGAMENTO SUPABASE COMPLETAMENTE FUNZIONANTE! ")
        
    except Exception as e:
        print(f" Errore connessione: {e}")
else:
    print(" SUPABASE_DB_URL non trovata nel file .env.db")
    print(" Assicurati che il file contenga: SUPABASE_DB_URL=postgresql://...")
