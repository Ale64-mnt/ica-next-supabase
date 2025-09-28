from pathlib import Path
import json
import textwrap
import sys

# --- CONFIGURAZIONE DESIDERATA ---
# Contenuto completo dei file di traduzione e delle pagine

FULL_IT_MESSAGES = {
    "about": {"intro": "Informazioni sul progetto.", "title": "Chi siamo"},
    "admin": {"blog": {"intro": "Crea un nuovo post e (se vuoi) carica una cover.", "title": "Admin – Gestione Blog"}},
    "articles": {"intro": "Approfondimenti e guide.", "title": "Articoli"},
    "blog": {
        "empty": "Nessun articolo pubblicato.", "intro": "Articoli e aggiornamenti.", "next": "Successivi",
        "page": "Pagina", "prev": "Precedenti", "title": "Blog", "category": "Categoria",
        "readMore": "Leggi di più", "allArticles": "Tutti gli articoli"
    },
    "contact": {"intro": "Come contattarci.", "title": "Contatti"},
    "faq": {"intro": "Risposte alle domande più comuni.", "title": "Domande frequenti"},
    "glossary": {"intro": "Termini e definizioni utili.", "title": "Glossario"},
    "home": {"intro": "Sito Next.js + i18n", "title": "Benvenuto", "empty": "Nessun contenuto disponibile."},
    "nav": {
        "about": "Chi siamo", "articles": "Articoli", "contact": "Contatti",
        "faq": "FAQ", "glossary": "Glossario", "home": "Home", "news": "Notizie"
    },
    "news": {
        "empty": "Nessuna notizia disponibile.", "intro": "Ultime notizie di educazione finanziaria e digitale.",
        "readMore": "Leggi di più", "title": "Notizie",
        "list": {"title": "Notizie", "empty": "Nessuna news disponibile.", "prev": "Precedente", "next": "Successiva"}
    }
}

UPDATED_LAYOUT_TSX = """
    import type {{ReactNode}} from 'react';
    import {{NextIntlClientProvider}} from 'next-intl';
    import {{getMessages}} from 'next-intl/server';
    import SiteHeader from '@/components/SiteHeader';
    import SiteFooter from '@/components/SiteFooter';
    
    type Props = {{
      children: ReactNode;
      params: {{locale: string}};
    }};
    
    export default async function LocaleLayout({{children, params: {{locale}}}}: Props) {{
      const messages = await getMessages();
    
      return (
        <html lang={{locale}}>
          <body>
            <NextIntlClientProvider locale={{locale}} messages={{messages}}>
              <SiteHeader />
              {{children}}
              <SiteFooter />
            </NextIntlClientProvider>
          </body>
        </html>
      );
    }}
"""

UPDATED_PAGE_TSX = """
    import {{ getTranslations }} from 'next-intl/server';
    import {{ createClient }} from '@/lib/supabase/server';
    import BasicPage from '@/components/BasicPage'; // Assumendo che BasicPage sia il tuo componente

    export default async function HomePage() {{
      const t = await getTranslations('home');
      const supabase = createClient();

      const {{ data: articles }} = await supabase.from('articles').select('title');

      return (
        <BasicPage t={{t}} namespace="home">
          {{/* Qui puoi aggiungere altri contenuti specifici per la home page se necessario */}}
          <h2>Articoli dal Database:</h2>
          <ul>
            {{articles?.map((article) => (
              <li key={{article.title}}>{{article.title}}</li>
            ))}}
          </ul>
        </BasicPage>
      );
    }}
"""

def run_reintegration(base_path):
    """Esegue la reintegrazione e la verifica."""
    print("--- 🚀 Inizio reintegrazione del progetto... ---")
    
    # 1. Verifica prerequisiti (copia manuale)
    print("🔎 Verifico la presenza dei componenti necessari...")
    required_components = ["SiteHeader.tsx", "SiteFooter.tsx", "BasicPage.tsx"]
    for component in required_components:
        if not (base_path / "components" / component).is_file():
            print(f"🚨 ERRORE: File componente mancante: '{component}'.")
            print("   Assicurati di aver copiato la cartella 'components' dal vecchio progetto prima di eseguire.")
            sys.exit(1)
    print("✅ Prerequisiti verificati.")

    # 2. Aggiorna file
    (base_path / "messages" / "it.json").write_text(json.dumps(FULL_IT_MESSAGES, indent=2, ensure_ascii=False), encoding='utf-8')
    print("✅ File 'messages/it.json' aggiornato con i contenuti completi.")
    # Nota: qui creiamo un en.json base, da tradurre in seguito
    (base_path / "messages" / "en.json").write_text(json.dumps(FULL_IT_MESSAGES, indent=2, ensure_ascii=False), encoding='utf-8')
    print("✅ File 'messages/en.json' creato/aggiornato (da tradurre).")

    (base_path / "app" / "[locale]" / "layout.tsx").write_text(textwrap.dedent(UPDATED_LAYOUT_TSX).strip(), encoding='utf-8')
    print("✅ File 'layout.tsx' aggiornato con Header e Footer.")
    
    (base_path / "app" / "[locale]" / "page.tsx").write_text(textwrap.dedent(UPDATED_PAGE_TSX).strip(), encoding='utf-8')
    print("✅ File 'page.tsx' aggiornato per usare BasicPage e caricare i dati.")
    
    print("\n--- ✅ Reintegrazione completata con successo! ---")


if __name__ == "__main__":
    project_root = Path.cwd()
    if project_root.name != 'webapp':
        print("🚨 ERRORE: Esegui questo script dalla cartella 'webapp'!")
        sys.exit(1)
        
    run_reintegration(project_root)
    
    print("\n--- 🏁 PROSSIMI PASSI ---")
    print("1. Riavvia il server con 'npm run dev'.")
    print("2. Controlla il sito nel browser per assicurarti che tutto funzioni.")
    print("3. Fai il commit delle modifiche su Git.")