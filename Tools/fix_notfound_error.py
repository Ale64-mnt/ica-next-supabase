from pathlib import Path
import textwrap
import sys

CORRECT_I18N_TS = """
    // Ora gestiamo l'errore in modo sicuro senza chiamare notFound()
    
    // Questa funzione carica i messaggi o restituisce un oggetto vuoto in caso di errore
    export async function getMessages(locale: string) {
      try {
        return (await import(`./messages/${locale}.json`)).default;
      } catch (error) {
        // Non chiamiamo notFound() qui, ma restituiamo un oggetto vuoto
        // La logica per la lingua mancante sarà gestita nel middleware o nel layout
        console.error(`Missing messages for locale: ${locale}`);
        return {};
      }
    }
"""

CORRECT_LAYOUT_TSX = """
    import type { ReactNode } from 'react';
    import { NextIntlClientProvider } from 'next-intl';
    import { getMessages } from '@/i18n';
    import SiteHeader from '@/components/SiteHeader';
    import SiteFooter from '@/components/SiteFooter';
    import { notFound } from 'next/navigation';

    type Props = {
      children: ReactNode;
      params: { locale: string };
    };

    export default async function LocaleLayout({ children, params: { locale } }: Props) {
      const messages = await getMessages(locale);

      // Se non ci sono messaggi, significa che la lingua non è valida
      if (Object.keys(messages).length === 0) {
        notFound();
      }

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
    print("--- 🚀 Inizio correzione errore notFound()... ---")
    
    files_to_fix = {
        "i18n.ts": CORRECT_I18N_TS,
        "app/[locale]/layout.tsx": CORRECT_LAYOUT_TSX
    }
    
    for path_str, content in files_to_fix.items():
        full_path = base_path / Path(path_str)
        if full_path.is_file():
            full_path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
            print(f"✅ File corretto: {path_str}")

    print("\\n✅ Correzione completata!")

if __name__ == "__main__":
    project_root = Path.cwd()
    if 'webapp' not in str(project_root):
        print("🚨 ERRORE: Esegui questo script dalla cartella 'webapp'!")
        sys.exit(1)
    run_fixes(project_root)
    print("\\n🏁 Riavvia il server con 'npm run dev'.")