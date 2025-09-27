import textwrap
from pathlib import Path

def print_info(message):
    print(f"ℹ️ {message}")

def print_success(message):
    print(f"✅ {message}")

def print_warning(message):
    print(f"⚠️ {message}")

def get_credentials():
    """Chiede all'utente di inserire le credenziali Supabase."""
    print_info("Inserisci le credenziali del tuo progetto Supabase (le trovi in Settings > API).")
    url = input("   - Inserisci NEXT_PUBLIC_SUPABASE_URL: ").strip()
    anon_key = input("   - Inserisci NEXT_PUBLIC_SUPABASE_ANON_KEY: ").strip()
    
    if not url or not anon_key:
        print_warning("URL o Chiave non validi. Uscita.")
        return None, None
        
    return url, anon_key

def create_files(base_path, url, anon_key):
    """Crea tutti i file necessari con il contenuto corretto."""
    
    # Dizionario con percorsi e contenuto dei file
    files_to_create = {
        ".env.local": f"""
            NEXT_PUBLIC_SUPABASE_URL="{url}"
            NEXT_PUBLIC_SUPABASE_ANON_KEY="{anon_key}"
        """,
        "lib/supabase/client.ts": """
            import { createBrowserClient } from '@supabase/ssr'

            export function createClient() {
              return createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              )
            }
        """,
        "lib/supabase/server.ts": """
            import { createServerClient, type CookieOptions } from '@supabase/ssr'
            import { cookies } from 'next/headers'

            export function createClient() {
              const cookieStore = cookies()

              return createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                  cookies: {
                    get(name: string) {
                      return cookieStore.get(name)?.value
                    },
                  },
                }
              )
            }
        """,
        "app/[locale]/supabase-test/page.tsx": """
            import { createClient } from '@/lib/supabase/server';
            import { getTranslations } from 'next-intl/server';

            export default async function SupabaseTestPage() {
              const supabase = createClient();
              const t = await getTranslations('Home'); // Usa un namespace che sai esistere

              const { data: articles, error } = await supabase
                .from('articles')
                .select('titolo'); // Assicurati che la colonna 'titolo' esista

              if (error) {
                return <pre>Errore di Supabase: {error.message}</pre>
              }

              return (
                <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
                  <h1>{t('title')}</h1>
                  <h2>Test di Connessione a Supabase</h2>
                  <p>Query eseguita sulla tabella `articles`:</p>
                  <pre style={{ background: '#eee', padding: '1rem', borderRadius: '5px' }}>
                    {JSON.stringify(articles, null, 2)}
                  </pre>
                </main>
              );
            }
        """
    }
    
    print("\n--- 🚀 Inizio creazione/aggiornamento file... ---")
    for path_str, content in files_to_create.items():
        full_path = base_path / Path(path_str)
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
        print_success(f"File creato/aggiornato: {path_str}")
        
    print("--- Configurazione Supabase applicata con successo! ---\n")

if __name__ == "__main__":
    supabase_url, supabase_key = get_credentials()
    if supabase_url and supabase_key:
        # Lo script assume di essere eseguito dalla cartella `webapp`
        project_root = Path.cwd()
        create_files(project_root, supabase_url, supabase_key)
        
        print_warning("--- AZIONI SUCCESSIVE ---")
        print_warning("1. Assicurati di aver installato le dipendenze: npm install @supabase/ssr @supabase/supabase-js")
        print_warning("2. Riavvia il server con 'npm run dev'.")
        print_warning("3. Visita http://localhost:3000/it/supabase-test per vedere il risultato.")