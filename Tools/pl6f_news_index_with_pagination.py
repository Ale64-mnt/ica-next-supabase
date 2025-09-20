# -*- coding: utf-8 -*-
"""
pl6f_news_index_with_pagination.py
Crea la pagina lista News con paginazione server-side:
 - /webapp/app/[locale]/news/page.tsx
 - /webapp/components/Pagination.tsx
 - Integra chiavi i18n minime in messages/it.json e en.json (se mancanti)

Idempotente: non sovrascrive file esistenti, patcha i JSON mantenendo la formattazione base.
"""

from __future__ import annotations
import json
import sys
from pathlib import Path

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"

PAGE_FILE = WEBAPP / "app" / "[locale]" / "news" / "page.tsx"
PAGINATION_CMP = WEBAPP / "components" / "Pagination.tsx"
MSG_IT = WEBAPP / "messages" / "it.json"
MSG_EN = WEBAPP / "messages" / "en.json"

PAGE_TSX = r"""import Link from 'next/link';
import { notFound } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';

type NewsRow = { id: number; slug: string; title: string; summary: string; lang: string };

const PAGE_SIZE = 8;

async function fetchPage(params: { locale: string; page: number }): Promise<{rows: NewsRow[]; total: number; usedOrder: 'created_at'|'id'}> {
  const { locale, page } = params;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  async function run(orderKey: 'created_at'|'id') {
    const order = orderKey === 'created_at' ? 'created_at.desc' : 'id.desc';
    const listUrl = `${base}/rest/v1/news?lang=eq.${locale}&select=id,slug,title,summary,lang&order=${order}&limit=${PAGE_SIZE}&offset=${from}`;
    const countUrl = `${base}/rest/v1/news?lang=eq.${locale}&select=id&limit=1`;
    const headers = { apikey: anon, Authorization: `Bearer ${anon}` };

    const [lr, cr] = await Promise.all([fetch(listUrl, { headers, cache: 'no-store' }), fetch(countUrl, { headers, cache: 'no-store' })]);
    if (!lr.ok || !cr.ok) throw new Error('fetch failed');

    const rows: NewsRow[] = await lr.json();
    const total = Number(cr.headers.get('content-range')?.split('/')?.[1] ?? '0'); // Supabase REST setta Content-Range: items x-y/total
    return { rows, total, usedOrder: orderKey as const };
  }

  // Prova con created_at, fallback a id se la colonna non esiste
  try {
    return await run('created_at');
  } catch {
    return await run('id');
  }
}

export default async function NewsIndex({ params, searchParams } : { params: { locale: string }, searchParams: { page?: string }}) {
  const locale = params.locale;
  if (!['it','en'].includes(locale)) notFound();

  const page = Math.max(0, parseInt(searchParams?.page ?? '0', 10) || 0);
  const { rows, total } = await fetchPage({ locale, page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-5xl px-4">
      <h1 className="mb-6 text-3xl font-bold">{locale === 'it' ? 'News' : 'News'}</h1>

      {rows.length === 0 ? (
        <p className="text-gray-600">{locale === 'it' ? 'Nessuna news disponibile.' : 'No news available.'}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((n) => (
            <ArticleCard
              key={`${n.lang}:${n.slug}`}
              href={`/${n.lang}/news/${encodeURIComponent(n.slug)}`}
              title={n.title}
              summary={n.summary}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination current={page} totalPages={totalPages} basePath={`/${locale}/news`} />
      </div>
    </section>
  );
}

export const dynamic = 'force-dynamic';
"""

PAGINATION_TSX = r"""'use client';
import Link from 'next/link';

export default function Pagination({ current, totalPages, basePath }: { current: number; totalPages: number; basePath: string }) {
  const prev = current > 0 ? current - 1 : 0;
  const next = current + 1 < totalPages ? current + 1 : current;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <Link
        aria-disabled={current === 0}
        className={`rounded-xl border px-3 py-2 text-sm ${current === 0 ? 'pointer-events-none opacity-50' : ''}`}
        href={`${basePath}?page=${prev}`}
      >
        ◀ Prev
      </Link>

      <span className="text-sm">{current + 1} / {totalPages}</span>

      <Link
        aria-disabled={current + 1 >= totalPages}
        className={`rounded-xl border px-3 py-2 text-sm ${current + 1 >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
        href={`${basePath}?page=${next}`}
      >
        Next ▶
      </Link>
    </nav>
  );
}
"""

I18N_KEYS = {
    "it": {
        "news": {
            "list": {
                "title": "News",
                "empty": "Nessuna news disponibile.",
                "prev": "Precedente",
                "next": "Successiva"
            }
        }
    },
    "en": {
        "news": {
            "list": {
                "title": "News",
                "empty": "No news available.",
                "prev": "Prev",
                "next": "Next"
            }
        }
    }
}

def merge_json_keys(path: Path, addition: dict) -> bool:
    """Unione superficiale delle chiavi target (non distruttiva). Ritorna True se scritto."""
    changed = False
    data = {}
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            # se il JSON non è valido, non lo tocchiamo
            return False
    else:
        data = {}

    def deep_merge(d: dict, a: dict) -> bool:
        ch = False
        for k, v in a.items():
            if k not in d:
                d[k] = v
                ch = True
            else:
                if isinstance(v, dict) and isinstance(d.get(k), dict):
                    if deep_merge(d[k], v): ch = True
        return ch

    if deep_merge(data, addition):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        changed = True
    return changed

def ensure_file(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path.relative_to(ROOT)}"

def main() -> int:
    notes = []
    notes.append(ensure_file(PAGINATION_CMP, PAGINATION_TSX))
    notes.append(ensure_file(PAGE_FILE, PAGE_TSX))

    it_changed = merge_json_keys(MSG_IT, I18N_KEYS["it"])
    en_changed = merge_json_keys(MSG_EN, I18N_KEYS["en"])
    notes.append(("PATCH messages/it.json" if it_changed else "OK messages/it.json"))
    notes.append(("PATCH messages/en.json" if en_changed else "OK messages/en.json"))

    print("=== PL-6f (news index) ===")
    for n in notes:
        print(n)
    return 0

if __name__ == "__main__":
    sys.exit(main())
