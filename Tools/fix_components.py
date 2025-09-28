from pathlib import Path
import textwrap
import sys

# --- CONFIGURAZIONE DEI FILE CORRETTI ---
# Qui definiamo il contenuto esatto e corretto per ogni file da sistemare.

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

CORRECT_PAGE_TSX = """
    import { getTranslations } from 'next-intl/server';
    import BasicPage from '@/components/BasicPage';
    
    // Funzione asincrona per caricare i dati (puoi aggiungerne da Supabase qui)
    async function getData() {
      // Esempio: const { data } = await supabase.from('articles').select('*');
      return { articles: [] }; // Ritorna un valore di default per ora
    }

    export default async function HomePage() {
      const t = await getTranslations('home');
      const data = await getData();
      
      return (
        <BasicPage t={t} namespace="home">
          {/* Qui puoi iniziare a costruire il contenuto della tua homepage */}
          <h2>Contenuto della Pagina</h2>
        </BasicPage>
      );
    }
"""

CORRECT_BASICPAGE_TSX = """
    import type { ReactNode } from "react";

    // Definiamo un tipo per la funzione 't' per maggiore sicurezza
    type TFunction = (key: string) => string;

    type BasicPageProps = {
      children: ReactNode;
      t: TFunction; // 't' è ora una prop obbligatoria
      namespace: string;
      title?: string;
      intro?: string;
    };

    export default function BasicPage({
      t,
      title,
      intro,
      children,
      namespace
    }: BasicPageProps) {
      
      // Ora 't' viene ricevuto come prop e usato in sicurezza
      const resolvedTitle = title ?? t("title");
      const resolvedIntro = intro ?? t("intro");

      return (
        <main className="container mx-auto px-4 py-8">
          <header>
            <h1 className="text-4xl font-bold mb-2">{resolvedTitle}</h1>
            <p className="text-lg text-gray-600">{resolvedIntro}</p>
          </header>
          <div className="mt-8">
            {children}
          </div>
        </main>
      );
    }
"""

def run_fixes(base_path):
    """Sovrascrive i file con il loro contenuto corretto e verifica il risultato."""
    print("--- 🚀 Inizio correzione dei componenti... ---")
    
    files_to_fix = {
        "app/[locale]/layout.tsx": CORRECT_LAYOUT_TSX,
        "app/[locale]/page.tsx": CORRECT_PAGE_TSX,
        "components/BasicPage.tsx": CORRECT_BASICPAGE_TSX
    }

    all_successful = True
    for path_str, content in files_to_fix.items():
        full_path = base_path / Path(path_str)
        if full_path.is_file():
            try:
                # Scrive il nuovo contenuto
                full_path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
                
                # Verifica rileggendo il file
                written_content = full_path.read_text(encoding='utf-8').replace('\\r\\n', '\\n')
                expected_content = textwrap.dedent(content).strip().replace('\\r\\n', '\\n')

                if written_content == expected_content:
                    print(f"✅ File corretto e verificato: {path_str}")
                else:
                    print(f"❌ ERRORE: Il contenuto di '{path_str}' non è stato scritto correttamente.")
                    all_successful = False
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
    print("2. Controlla il sito nel browser. Tutti gli errori dovrebbero essere spariti.")