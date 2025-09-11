# Tools/phase3_pages_scaffold.py
# Crea Navbar, LanguageSwitcher, BasicPage e le pagine secondarie.
# Aggiorna messages/*.json con titoli/nav base.
# Esecuzione: .\.venv\Scripts\python.exe Tools\phase3_pages_scaffold.py

from pathlib import Path
import json
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
assert WEB.exists(), f"webapp non trovata in {WEB}"

def backup(p: Path):
    if p.exists():
        p.rename(p.with_suffix(p.suffix + f".bak-{datetime.now().strftime('%Y%m%d-%H%M%S')}"))

def write(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        backup(p)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")

# --- 1) Component: BasicPage (client, legge namespace con useTranslations) ---
basic_page = """'use client';
import {useTranslations} from 'next-intl';

export default function BasicPage({ns}:{ns:string}) {
  const t = useTranslations(ns);
  return (
    <main className="container" style={{padding:'2rem'}}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
    </main>
  );
}
"""
write(WEB / "components" / "BasicPage.tsx", basic_page)

# --- 2) Component: LanguageSwitcher (client) ---
lang_switcher = """'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {locales} from '@/i18n/routing';

export default function LanguageSwitcher(){
  const pathname = usePathname() || '/it';
  // rimuovi il primo segmento /xx
  const rest = pathname.replace(/^\\/[a-z]{2}(?=\\/|$)/, '');
  return (
    <div style={{display:'flex', gap:'0.5rem'}}>
      {locales.map(l => (
        <Link key={l} href={`/${l}${rest || ''}`}>{l.toUpperCase()}</Link>
      ))}
    </div>
  );
}
"""
write(WEB / "components" / "LanguageSwitcher.tsx", lang_switcher)

# --- 3) Component: Nav (client) ---
nav_tsx = """'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';

export default function Nav(){
  const pathname = usePathname() || '/it';
  const locale = (pathname.split('/')[1] || 'it');
  const t = useTranslations('nav');

  const link = (slug:string) => `/${locale}${slug}`;

  return (
    <nav style={{display:'flex',gap:'1rem',padding:'1rem',borderBottom:'1px solid #eee'}}>
      <Link href={link('')}>{t('home')}</Link>
      <Link href={link('/about')}>{t('about')}</Link>
      <Link href={link('/news')}>{t('news')}</Link>
      <Link href={link('/articles')}>{t('articles')}</Link>
      <Link href={link('/faq')}>{t('faq')}</Link>
      <Link href={link('/glossary')}>{t('glossary')}</Link>
      <Link href={link('/contact')}>{t('contact')}</Link>
    </nav>
  );
}
"""
write(WEB / "components" / "Nav.tsx", nav_tsx)

# --- 4) Pagine server che rendono BasicPage ---
page_tpl = """import BasicPage from '@/components/BasicPage';
export const dynamic = 'force-static';
export default function Page(){ return <BasicPage ns='{ns}'/>; }
"""

pages = ["about","news","articles","contact","faq","glossary"]
for slug in pages:
    write(WEB / "app" / "[locale]" / slug / "page.tsx", page_tpl.format(ns=slug))

# --- 5) Inserisci Nav nel layout se non c'è già ---
layout_p = WEB / "app" / "[locale]" / "layout.tsx"
if layout_p.exists():
    txt = layout_p.read_text(encoding="utf-8")
    if "import Nav from '@/components/Nav';" not in txt:
        txt = txt.replace("from '@/i18n/routing';", "from '@/i18n/routing';\nimport Nav from '@/components/Nav';")
    if "<Nav />" not in txt:
        txt = txt.replace("<body>", "<body>\\n        <Nav />")
    write(layout_p, txt)

# --- 6) Aggiorna messages/*.json ---
seed = {
    "it": {
        "nav": {"home":"Home","about":"Chi siamo","news":"Notizie","articles":"Articoli","contact":"Contatti","faq":"FAQ","glossary":"Glossario"},
        "about":{"title":"Chi siamo","intro":"Informazioni sul progetto."},
        "news":{"title":"Notizie","intro":"Ultimi aggiornamenti dal nostro team."},
        "articles":{"title":"Articoli","intro":"Approfondimenti e guide."},
        "contact":{"title":"Contatti","intro":"Come contattarci."},
        "faq":{"title":"Domande frequenti","intro":"Risposte alle domande più comuni."},
        "glossary":{"title":"Glossario","intro":"Termini e definizioni utili."}
    },
    "en": {
        "nav": {"home":"Home","about":"About","news":"News","articles":"Articles","contact":"Contact","faq":"FAQ","glossary":"Glossary"},
        "about":{"title":"About us","intro":"Information about the project."},
        "news":{"title":"News","intro":"Latest updates from our team."},
        "articles":{"title":"Articles","intro":"Insights and guides."},
        "contact":{"title":"Contact","intro":"How to reach us."},
        "faq":{"title":"FAQ","intro":"Frequently asked questions."},
        "glossary":{"title":"Glossary","intro":"Useful terms and definitions."}
    },
    "fr": {
        "nav": {"home":"Accueil","about":"À propos","news":"Actualités","articles":"Articles","contact":"Contact","faq":"FAQ","glossary":"Glossaire"},
        "about":{"title":"À propos","intro":"Informations sur le projet."},
        "news":{"title":"Actualités","intro":"Dernières nouvelles de notre équipe."},
        "articles":{"title":"Articles","intro":"Analyses et guides."},
        "contact":{"title":"Contact","intro":"Comment nous contacter."},
        "faq":{"title":"FAQ","intro":"Questions fréquemment posées."},
        "glossary":{"title":"Glossaire","intro":"Termes et définitions utiles."}
    },
    "es": {
        "nav": {"home":"Inicio","about":"Quiénes somos","news":"Noticias","articles":"Artículos","contact":"Contacto","faq":"FAQ","glossary":"Glosario"},
        "about":{"title":"Quiénes somos","intro":"Información sobre el proyecto."},
        "news":{"title":"Noticias","intro":"Últimas novedades de nuestro equipo."},
        "articles":{"title":"Artículos","intro":"Análisis y guías."},
        "contact":{"title":"Contacto","intro":"Cómo contactarnos."},
        "faq":{"title":"FAQ","intro":"Preguntas frecuentes."},
        "glossary":{"title":"Glosario","intro":"Términos y definiciones útiles."}
    },
    "de": {
        "nav": {"home":"Start","about":"Über uns","news":"News","articles":"Artikel","contact":"Kontakt","faq":"FAQ","glossary":"Glossar"},
        "about":{"title":"Über uns","intro":"Informationen zum Projekt."},
        "news":{"title":"News","intro":"Neueste Updates unseres Teams."},
        "articles":{"title":"Artikel","intro":"Einblicke und Anleitungen."},
        "contact":{"title":"Kontakt","intro":"So erreichen Sie uns."},
        "faq":{"title":"FAQ","intro":"Häufig gestellte Fragen."},
        "glossary":{"title":"Glossar","intro":"Nützliche Begriffe und Definitionen."}
    }
}

msg_dir = WEB / "messages"
for loc, add in seed.items():
    path = msg_dir / f"{loc}.json"
    existing = {}
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            existing = {}
    # merge shallow
    for k,v in add.items():
        existing.setdefault(k, {})
        if isinstance(v, dict):
            for kk, vv in v.items():
                existing[k].setdefault(kk, vv)
        else:
            existing[k] = v
    write(path, json.dumps(existing, ensure_ascii=False, indent=2) + "\\n")

print("=== Fase 3 scaffold COMPLETATA ===")
