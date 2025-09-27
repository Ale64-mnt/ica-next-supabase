import os
from pathlib import Path
import textwrap

# --- CONFIGURAZIONE DESIDERATA ---
# Qui definiamo tutti i file, le cartelle e il loro contenuto.
# Per creare una cartella, usa None come contenuto.
DESIRED_STRUCTURE = {
    # File di configurazione di next-intl
    "i18n.ts": """
        import {getRequestConfig} from 'next-intl/server';
        
        export default getRequestConfig(async ({locale}) => ({
          locale,
          messages: (await import(`./messages/${locale}.json`)).default
        }));
    """,

    # Middleware per la gestione delle rotte
    "middleware.ts": """
        import createMiddleware from 'next-intl/middleware';
        
        export default createMiddleware({
          locales: ['it', 'en'],
          defaultLocale: 'it'
        });
        
        export const config = {
          matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
        };
    """,

    # Cartella per i file di traduzione
    "messages": None,

    # File di traduzione italiano
    "messages/it.json": """
        {
          "HomePage": {
            "title": "Progetto Funzionante!"
          }
        }
    """,
    
    # File di traduzione inglese
    "messages/en.json": """
        {
          "HomePage": {
            "title": "Working Project!"
          }
        }
    """,

    # Struttura cartelle per l'App Router
    "app/[locale]": None,
    
    # Layout principale
    "app/[locale]/layout.tsx": """
        import type {ReactNode} from 'react';
        import {NextIntlClientProvider} from 'next-intl';
        import {getMessages} from 'next-intl/server';
        
        type Props = {
          children: ReactNode;
          params: {locale: string};
        };
        
        export default async function LocaleLayout({children, params: {locale}}: Props) {
          const messages = await getMessages();
        
          return (
            <html lang={locale}>
              <body>
                <NextIntlClientProvider locale={locale} messages={messages}>
                  {children}
                </NextIntlClientProvider>
              </body>
            </html>
          );
        }
    """,

    # Pagina principale
    "app/[locale]/page.tsx": """
        import {getTranslations} from 'next-intl/server';
        
        export default async function HomePage() {
          const t = await getTranslations('HomePage');
          return <h1>{t('title')}</h1>;
        }
    """
}

def apply_structure(base_path, structure):
    """Crea o aggiorna la struttura di file e cartelle."""
    print("--- 🚀 Inizio creazione/aggiornamento della struttura... ---")
    for path_str, content in structure.items():
        full_path = base_path / Path(path_str)
        
        # Se il contenuto è None, è una cartella
        if content is None:
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Cartella assicurata: {path_str}")
        # Altrimenti, è un file
        else:
            # Assicura che la cartella genitore esista
            full_path.parent.mkdir(parents=True, exist_ok=True)
            # Scrive il contenuto nel file
            # textwrap.dedent rimuove l'indentazione iniziale per un file pulito
            full_path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
            print(f"✅ File creato/aggiornato: {path_str}")
    print("--- Struttura applicata con successo! ---\n")

def verify_structure(base_path, structure):
    """Verifica che la struttura corrisponda a quella desiderata."""
    print("--- 🔎 Inizio verifica della struttura... ---")
    errors = []
    
    for path_str, expected_content in structure.items():
        full_path = base_path / Path(path_str)
        
        if expected_content is None:
            if not full_path.is_dir():
                errors.append(f"❌ ERRORE: La cartella '{path_str}' non è stata trovata.")
        else:
            if not full_path.is_file():
                errors.append(f"❌ ERRORE: Il file '{path_str}' non è stato trovato.")
                continue
            
            try:
                actual_content = full_path.read_text(encoding='utf-8')
                # Normalizza per evitare problemi di fine riga (Windows/Linux)
                if actual_content.replace('\r\n', '\n') != textwrap.dedent(expected_content).strip().replace('\r\n', '\n'):
                    errors.append(f"❌ ERRORE: Il contenuto del file '{path_str}' non corrisponde.")
            except Exception as e:
                errors.append(f"❌ ERRORE: Impossibile leggere il file '{path_str}': {e}")

    if not errors:
        print("--- ✅ Verifica completata con successo! Tutti i file e le cartelle sono corretti. ---")
    else:
        print("--- 🚨 Verifica fallita. Sono stati trovati i seguenti problemi: ---")
        for error in errors:
            print(error)
            
if __name__ == "__main__":
    # La base del progetto è la cartella in cui si esegue lo script
    project_root = Path.cwd()
    
    apply_structure(project_root, DESIRED_STRUCTURE)
    verify_structure(project_root, DESIRED_STRUCTURE)