from pathlib import Path
import psycopg2

print("🎯 TEST LETTURA DIRETTA SENZA DOTENV")
print("=" * 40)

# Leggi direttamente dal file .env.db
env_db_path = Path(__file__).parent.parent / '.env.db'

print(f"Percorso file: {env_db_path}")
print(f"File esiste: {env_db_path.exists()}")

if env_db_path.exists():
    with open(env_db_path, 'r') as f:
        content = f.read().strip()
        print(f"Contenuto file: {content}")
        
        # Estrai la URL dal formato KEY=VALUE
        if '=' in content:
            key, db_url = content.split('=', 1)
            print(f"Chiave: {key}")
            print(f"Valore: {db_url[:80]}...")
            
            # Test connessione diretta
            try:
                conn = psycopg2.connect(db_url.strip())
                cursor = conn.cursor()
                
                cursor.execute('SELECT version();')
                version = cursor.fetchone()
                print(" CONNESSIONE DATABASE RIUSCITA!")
                print(f" PostgreSQL: {version[0]}")
                
                # Test dati
                cursor.execute('SELECT COUNT(*) FROM articles;')
                count = cursor.fetchone()[0]
                print(f" Articoli nel database: {count}")
                
                cursor.close()
                conn.close()
                print(f"\n COLLEGAMENTO SUPABASE FUNZIONANTE!")
                
            except Exception as e:
                print(f" Errore connessione: {e}")
        else:
            print(" Formato file errato - deve essere KEY=VALUE")
else:
    print(" File .env.db non trovato")
