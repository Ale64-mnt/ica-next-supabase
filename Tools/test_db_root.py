import os
import psycopg2
from dotenv import load_dotenv
from pathlib import Path

# Carica .env.db dalla ROOT
env_path = Path(__file__).parent.parent / '.env.db'
load_dotenv(env_path)

def test_db_connection():
    db_url = os.getenv('SUPABASE_DB_URL')
    
    if not db_url:
        print(' SUPABASE_DB_URL non trovata in ../.env.db')
        return False
    
    print(f' Connessione a: {db_url[:50]}...')
    
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Test versione PostgreSQL
        cursor.execute('SELECT version();')
        version = cursor.fetchone()
        print(' Connessione database RIUSCITA!')
        print(f' PostgreSQL: {version[0]}')
        
        # Test tabella articles
        try:
            cursor.execute('SELECT COUNT(*) FROM articles;')
            count = cursor.fetchone()[0]
            print(f' Articoli nel DB: {count}')
        except Exception as e:
            print(f'ℹ Tabella articles: {e}')
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f' Errore connessione: {e}')
        return False

if __name__ == '__main__':
    test_db_connection()
