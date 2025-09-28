from pathlib import Path
import textwrap
import sys
import shutil

# --- CONFIGURAZIONE DEI FILE FINALI ---

LAYOUT_TSX_CONTENT = """
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
              {/* Qui puoi rimettere i tuoi componenti come SiteHeader e SiteFooter */}
              {children}
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }
"""

PAGE_TSX_CONTENT = """
    import {getTranslations} from 'next-intl/server';
    
    export default async function HomePage() {
      const t = await getTranslations('Index');
      return <h1>{t('title')}</h1>;
    }
"""

IT_JSON_CONTENT = """
    {
      "Index": {
        "title": "Configurazione completata!"
      }
    }
"""

EN_JSON_CONTENT = """
    {
      "Index": {
        "title": "Setup complete!"
      }
    }
"""

def apply_final_structure(base_path):
    """Applica la struttura finale e aggiorna i file."""
    print("--- 🚀 Inizio finalizzazione della struttura... ---")
    
    app_dir = base_path / "app"
    locale_dir = app_dir / "[locale]"
    messages_dir = base_path / "messages"

    # 1. Crea le cartelle
    locale_dir.mkdir(exist_ok=True)
    messages_dir.mkdir(exist_ok=True)
    print("✅ Cartelle 'app/[locale]' e 'messages' assicurate.")

    # 2. Sposta layout.tsx e page.tsx se si trovano ancora in /app
    for filename in ["layout.tsx", "page.tsx"]:
        source_path = app_dir / filename
        dest_path = locale_dir / filename
        if source_path.is_file():
            shutil.move(str(source_path), str(dest_path))
            print(f"✅ File '{filename}' spostato in 'app/[locale]'.")

    # 3. Crea/aggiorna i file con il contenuto finale
    files_to_write = {
        locale_dir / "layout.tsx": LAYOUT_TSX_CONTENT,
        locale_dir / "page.tsx": PAGE_TSX_CONTENT,
        messages_dir / "it.json": IT_JSON_CONTENT,
        messages_dir / "en.json": EN_JSON_CONTENT,
    }

    for path, content in files_to_write.items():
        path.write_text(textwrap.dedent(content).strip(), encoding='utf-8')
        print(f"✅ File creato/aggiornato: {path.relative_to(base_path)}")
        
    print("--- Struttura finalizzata con successo! ---\n")

def verify_final_structure(base_path):
    """Verifica che la struttura finale sia corretta."""
    print("--- 🔎 Inizio verifica finale... ---")
    errors = []
    
    # Verifica che i file non siano più in /app
    if (base_path / "app" / "layout.tsx").exists() or (base_path / "app" / "page.tsx").exists():
        errors.append("❌ ERRORE: layout.tsx o page.tsx si trovano ancora nella cartella 'app' radice.")
        
    # Verifica esistenza e contenuto dei file finali
    files_to_check = {
        base_path / "app" / "[locale]" / "layout.tsx": "NextIntlClientProvider",
        base_path / "app" / "[locale]" / "page.tsx": "getTranslations",
        base_path / "messages" / "it.json": '"title": "Configurazione completata!"',
        base_path / "messages" / "en.json": '"title": "Setup complete!"'
    }

    for path, check_string in files_to_check.items():
        if not path.is_file():
            errors.append(f"❌ ERRORE: File non trovato: {path.relative_to(base_path)}")
            continue
        if check_string not in path.read_text(encoding='utf-8'):
            errors.append(f"❌ ERRORE: Contenuto non corretto in: {path.relative_to(base_path)}")

    if not errors:
        print("--- ✅ Verifica completata con successo! La struttura è corretta. ---")
    else:
        print("--- 🚨 Verifica fallita. Sono stati trovati i seguenti problemi: ---")
        for error in errors:
            print(error)

if __name__ == "__main__":
    project_root = Path.cwd()
    if 'webapp' not in str(project_root):
        print("🚨 ERRORE: Esegui questo script dalla cartella 'webapp' del tuo progetto!")
        sys.exit(1)
    
    apply_final_structure(project_root)
    verify_final_structure(project_root)
    
    print("\n--- 🏁 PROSSIMI PASSI ---")
    print("1. Riavvia il server con 'npm run dev' per vedere il risultato finale.")