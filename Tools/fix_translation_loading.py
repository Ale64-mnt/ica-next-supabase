from pathlib import Path
import textwrap
import sys

# --- CONFIGURAZIONE DEI FILE CORRETTI ---

CORRECT_I18N_TS = """
    // Questo file ora esporta una funzione helper per caricare i messaggi specifici
    import {notFound} from 'next/navigation';

    export async function getMessagesForLocale(locale: string) {
      try {
        return (await import(`./messages/${locale}.json`)).default;
      } catch (error) {
        notFound();
      }
    }
"""

CORRECT_LAYOUT_TSX = """
    import type { ReactNode } from 'react';
    import { NextIntlClientProvider } from 'next-intl';
    import { getMessagesForLocale } from '@/i18n'; // Importa la nuova funzione
    import SiteHeader from '@/components/SiteHeader';
    import SiteFooter from '@/components/SiteFooter';

    type Props = {
      children: ReactNode;
      params: { locale: string };
    };

    export default async function LocaleLayout({ children, params: { locale } }: Props) {
      // Carica i messaggi solo per la lingua richiesta dall'URL
      const messages = await getMessagesForLocale(locale);

      return (
        <html lang={locale}>
          <body>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <SiteHeader />
              {children}
              <SiteFooter />
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }
"""

def run_fixes(base_path):
    """Sovrascrive i file con il loro contenuto corretto e verifica il risultato."""
    print("--- 🚀 Inizio correzione caricamento traduzioni... ---")
    
    files_to_fix = {
        "i18n.ts": CORRECT_I18N_TS,
        "app/[locale]/layout.tsx": CORRECT_LAYOUT_TSX
    }

    all_successful = True
    for path_str, content in files_to_fix.items():
        full_path = base_path / Path(path_str)
        if full_path.is_file():
            try:
                full_path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
                print(f"✅ File corretto: {path_str}")
            except Exception as e:
                print(f"❌ ERRORE durante la scrittura di '{path_str}': {e}")
                all_successful = False
        else:
            print(f"⚠️ ATTENZIONE: File non trovato, saltato: {path_str}")
            all_successful = False

    print("\\n--- Risultato ---")
    if all_successful:
        print("✅ Correzione completata con successo!")
    else:
        print("🚨 Alcuni problemi riscontrati durante la correzione.")


if __name__ == "__main__":
    project_root = Path.cwd()
    if 'webapp' not in str(project_root):
        print("🚨 ERRORE: Esegui questo script dalla cartella 'webapp' del tuo progetto!")
        sys.exit(1)
        
    run_fixes(project_root)
    
    print("\\n--- 🏁 PROSSIMI PASSI ---")
    print("1. Riavvia il server con 'npm run dev'.")
    print("2. Visita sia http://localhost:3000/it che http://localhost:3000/en per verificare le traduzioni.")