# Tools/phase2_i18n_home_scaffold.py
# Crea/aggiorna: messages/*.json (chiavi base) + Home page multilingua.
# Esecuzione: .\.venv\Scripts\python.exe Tools\phase2_i18n_home_scaffold.py

from pathlib import Path
from datetime import datetime
import json

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
assert WEB.exists(), f"Cartella non trovata: {WEB}"

def backup(p: Path):
    if p.exists():
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        p.rename(p.with_suffix(p.suffix + f".bak-{ts}"))

def write(p: Path, content: str, create_dir=True):
    if create_dir:
        p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        backup(p)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")

# 1) Aggiorna messages/*.json con chiavi minime
seed = {
    "it": {
        "home": {
            "title": "Benvenuto",
            "intro": "Sito Next.js + Supabase + next-intl."
        },
        "nav": {"home": "Home", "about": "Chi siamo", "news": "Notizie", "articles": "Articoli", "contact": "Contatti"},
        "common": {"cta": "Inizia ora"}
    },
    "en": {
        "home": {"title": "Welcome", "intro": "Next.js + Supabase + next-intl site."},
        "nav": {"home": "Home", "about": "About", "news": "News", "articles": "Articles", "contact": "Contact"},
        "common": {"cta": "Get started"}
    },
    "fr": {
        "home": {"title": "Bienvenue", "intro": "Site Next.js + Supabase + next-intl."},
        "nav": {"home": "Accueil", "about": "À propos", "news": "Actualités", "articles": "Articles", "contact": "Contact"},
        "common": {"cta": "Commencer"}
    },
    "es": {
        "home": {"title": "Bienvenido", "intro": "Sitio Next.js + Supabase + next-intl."},
        "nav": {"home": "Inicio", "about": "Quiénes somos", "news": "Noticias", "articles": "Artículos", "contact": "Contacto"},
        "common": {"cta": "Empezar"}
    },
    "de": {
        "home": {"title": "Willkommen", "intro": "Next.js + Supabase + next-intl Seite."},
        "nav": {"home": "Start", "about": "Über uns", "news": "News", "articles": "Artikel", "contact": "Kontakt"},
        "common": {"cta": "Loslegen"}
    }
}

msg_dir = WEB / "messages"
msg_dir.mkdir(parents=True, exist_ok=True)

def merge_messages(path: Path, add: dict):
    if path.exists():
        try:
            curr = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            curr = {}
    else:
        curr = {}
    # merge shallow per home/nav/common
    for k, v in add.items():
        curr.setdefault(k, {})
        if isinstance(v, dict):
            for kk, vv in v.items():
                curr[k].setdefault(kk, vv)
        else:
            curr[k] = v
    write(path, json.dumps(curr, ensure_ascii=False, indent=2) + "\n", create_dir=False)

for loc, data in seed.items():
    merge_messages(msg_dir / f"{loc}.json", data)

# 2) Component client: HomeContent (usa useTranslations)
home_client = """'use client';

import {useTranslations} from 'next-intl';

export default function HomeContent() {
  const t = useTranslations('home');
  return (
    <main className="container" style={{padding: '2rem'}}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
    </main>
  );
}
"""
write(WEB / "components" / "HomeContent.tsx", home_client)

# 3) app/[locale]/page.tsx (server, rende HomeContent)
page_tsx = """import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-static';

export default function Page() {
  return <HomeContent />;
}
"""
app_locale_dir = WEB / "app" / "[locale]"
app_locale_dir.mkdir(parents=True, exist_ok=True)
write(app_locale_dir / "page.tsx", page_tsx)

print("=== Fase 2: Home + messages COMPLETATA ===")
print(f"- messages/*.json aggiornati: {list(seed.keys())}")
print(f"- component: {WEB/'components/HomeContent.tsx'}")
print(f"- page:      {WEB/'app/[locale]/page.tsx'}")
