from pathlib import Path
import textwrap
import sys

# --- CONFIGURAZIONE DEI FILE CORRETTI ---

CORRECT_I18N_TS = """
    import {getRequestConfig} from 'next-intl/server';
    
    export default getRequestConfig(async ({locale}) => ({
      // This is the correct configuration that the library expects.
      messages: (await import(`./messages/${locale}.json`)).default
    }));
"""

CORRECT_LAYOUT_TSX = """
    import type { ReactNode } from 'react';
    import { NextIntlClientProvider } from 'next-intl';
    import { getMessages } from 'next-intl/server';
    import SiteHeader from '@/components/SiteHeader';
    import SiteFooter from '@/components/SiteFooter';

    type Props = {
      children: ReactNode;
      params: { locale: string };
    };

    export default async function LocaleLayout({ children, params: { locale } }: Props) {
      // getMessages works correctly when i18n.ts is properly configured.
      const messages = await getMessages();

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
    print("--- 🚀 Ripristino della configurazione di i18n... ---")
    
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
                print(f"✅ File ripristinato: {path_str}")
            except Exception as e:
                print(f"❌ ERRORE durante la scrittura di '{path_str}': {e}")
                all_successful = False
        else:
            print(f"⚠️ ATTENZIONE: File non trovato, saltato: {path_str}")
            all_successful = False

    print("\\n--- Risultato ---")
    if all_successful:
        print("✅ Ripristino completato con successo!")
    else:
        print("🚨 Alcuni problemi riscontrati durante il ripristino.")


if __name__ == "__main__":
    project_root = Path.cwd()
    if 'webapp' not in str(project_root):
        print("🚨 ERRORE: Esegui questo script dalla cartella 'webapp' del tuo progetto!")
        sys.exit(1)
        
    run_fixes(project_root)
    
    print("\\n--- 🏁 PROSSIMI PASSI ---")
    print("1. Riavvia il server con 'npm run dev'.")
    print("2. L'errore dovrebbe essere sparito.")