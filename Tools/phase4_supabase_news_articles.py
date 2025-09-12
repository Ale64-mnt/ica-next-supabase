# Tools/phase4_supabase_news_articles.py
# Fase 4: integrazione Supabase per liste News e Articles.
# Esecuzione: .\.venv\Scripts\python.exe Tools\phase4_supabase_news_articles.py

from pathlib import Path
import json
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
assert WEB.exists(), f"webapp non trovata: {WEB}"

def backup(p: Path):
    if p.exists():
        p.rename(p.with_suffix(p.suffix + f".bak-{datetime.now().strftime('%Y%m%d-%H%M%S')}"))

def write(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        backup(p)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")

# 1) Supabase client (server)
client_ts = """import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  // Nota: usare schema public; RLS abilitata lato Supabase
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}
"""
write(WEB / "lib" / "supabaseServer.ts", client_ts)

# 2) Componenti server: NewsList / ArticlesList
news_list = """import { getSupabaseServer } from '@/lib/supabaseServer';
import {format} from 'date-fns';

type NewsRow = {
  id: string;
  title: string;
  summary?: string | null;
  published_at?: string | null;
};

export default async function NewsList() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('news')
    .select('id, title, summary, published_at')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return <div style={{color:'crimson'}}>Errore nel caricamento delle news.</div>;
  }
  if (!data || data.length === 0) {
    return <div>Nessuna news disponibile.</div>;
  }

  return (
    <ul style={{display:'grid', gap:'0.75rem', padding:'0', listStyle:'none'}}>
      {data.map((n: NewsRow) => (
        <li key={n.id} style={{border:'1px solid #eee', borderRadius:8, padding:'0.75rem'}}>
          <div style={{fontWeight:600}}>{n.title}</div>
          {n.published_at ? <div style={{fontSize:12, opacity:0.7}}>{format(new Date(n.published_at), 'yyyy-MM-dd')}</div> : null}
          {n.summary ? <p style={{marginTop:6}}>{n.summary}</p> : null}
        </li>
      ))}
    </ul>
  );
}
"""
write(WEB / "components" / "NewsList.tsx", news_list)

articles_list = """import { getSupabaseServer } from '@/lib/supabaseServer';
import {format} from 'date-fns';

type ArticleRow = {
  id: string;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
};

export default async function ArticlesList() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, excerpt, published_at')
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return <div style={{color:'crimson'}}>Errore nel caricamento degli articoli.</div>;
  }
  if (!data || data.length === 0) {
    return <div>Nessun articolo disponibile.</div>;
  }

  return (
    <ul style={{display:'grid', gap:'0.75rem', padding:'0', listStyle:'none'}}>
      {data.map((a: ArticleRow) => (
        <li key={a.id} style={{border:'1px solid #eee', borderRadius:8, padding:'0.75rem'}}>
          <div style={{fontWeight:600}}>{a.title}</div>
          {a.published_at ? <div style={{fontSize:12, opacity:0.7}}>{format(new Date(a.published_at), 'yyyy-MM-dd')}</div> : null}
          {a.excerpt ? <p style={{marginTop:6}}>{a.excerpt}</p> : null}
        </li>
      ))}
    </ul>
  );
}
"""
write(WEB / "components" / "ArticlesList.tsx", articles_list)

# 3) Pagine che usano i componenti
news_page = """import BasicPage from '@/components/BasicPage';
import NewsList from '@/components/NewsList';
export const dynamic = 'force-dynamic'; // per vedere aggiornamenti
export default function Page(){
  return <>
    <BasicPage ns="news" />
    <div style={{padding:'0 2rem'}}><NewsList /></div>
  </>;
}
"""
write(WEB / "app" / "[locale]" / "news" / "page.tsx", news_page)

articles_page = """import BasicPage from '@/components/BasicPage';
import ArticlesList from '@/components/ArticlesList';
export const dynamic = 'force-dynamic';
export default function Page(){
  return <>
    <BasicPage ns="articles" />
    <div style={{padding:'0 2rem'}}><ArticlesList /></div>
  </>;
}
"""
write(WEB / "app" / "[locale]" / "articles" / "page.tsx", articles_page)

# 4) Messaggi: garantiamo titoli/intro
seed = {
    "it": {
        "news":{"title":"Notizie","intro":"Ultimi aggiornamenti dal nostro team."},
        "articles":{"title":"Articoli","intro":"Approfondimenti e guide."}
    },
    "en": {
        "news":{"title":"News","intro":"Latest updates from our team."},
        "articles":{"title":"Articles","intro":"Insights and guides."}
    },
    "fr": {
        "news":{"title":"Actualités","intro":"Dernières nouvelles de notre équipe."},
        "articles":{"title":"Articles","intro":"Analyses et guides."}
    },
    "es": {
        "news":{"title":"Noticias","intro":"Últimas novedades de nuestro equipo."},
        "articles":{"title":"Artículos","intro":"Análisis y guías."}
    },
    "de": {
        "news":{"title":"News","intro":"Neueste Updates unseres Teams."},
        "articles":{"title":"Artikel","intro":"Einblicke und Anleitungen."}
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
    for k,v in add.items():
        existing.setdefault(k, {})
        if isinstance(v, dict):
            for kk, vv in v.items():
                existing[k].setdefault(kk, vv)
        else:
            existing[k] = v
    write(path, json.dumps(existing, ensure_ascii=False, indent=2) + "\\n")

print("=== Fase 4: Supabase (News + Articles) COMPLETATA ===")
print("- Creati: lib/supabaseServer.ts, components/NewsList.tsx, components/ArticlesList.tsx")
print("- Pagine collegate: /[locale]/news, /[locale]/articles")
