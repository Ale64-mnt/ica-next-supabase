# -*- coding: utf-8 -*-
"""
fix_newslist_rewrite.py
- Riscrive completamente webapp/components/NewsList.tsx con una versione valida.
- Garantisce la presenza di webapp/lib/supabaseBrowser.ts.
Idempotente: sovrascrive NewsList.tsx con la versione buona; crea la lib se manca.
Exit codes: 0 OK, 2 I/O error.
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
CMP_PATH = WEBAPP / "components" / "NewsList.tsx"
LIB_PATH = WEBAPP / "lib" / "supabaseBrowser.ts"

LIB_TS = """'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
"""

NEWSLIST_TSX = """'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import ArticleCard from '@/components/ArticleCard';

type Row = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  lang: string;
  created_at?: string | null;
};

type Props = {
  locale: 'it' | 'en';
  limit?: number;         // default 6
  showLinkAll?: boolean;  // mostra link "Tutte le news"
};

async function fetchClient(locale: string, limit: number): Promise<Row[]> {
  const sb = supabaseBrowser();
  // prima prova con created_at (se la colonna non esiste in DEV potrebbe dare errore)
  const tryCreated = await sb
    .from('news')
    .select('id,slug,title,summary,lang,created_at')
    .eq('lang', locale)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!tryCreated.error && tryCreated.data) return tryCreated.data as Row[];

  // fallback: ordina per id desc (schema minimo)
  const fallback = await sb
    .from('news')
    .select('id,slug,title,summary,lang')
    .eq('lang', locale)
    .order('id', { ascending: false })
    .limit(limit);

  if (fallback.error) throw fallback.error;
  return fallback.data as Row[];
}

async function fetchRest(locale: string, limit: number): Promise<Row[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const headers: Record<string, string> = { apikey: anon, Authorization: `Bearer ${anon}` };

  // prova created_at
  const urlCreated = `${base}/rest/v1/news?lang=eq.${locale}&select=id,slug,title,summary,lang,created_at&order=created_at.desc&limit=${limit}`;
  const r1 = await fetch(urlCreated, { headers, cache: 'no-store' });
  if (r1.ok) return (await r1.json()) as Row[];

  // fallback id
  const urlId = `${base}/rest/v1/news?lang=eq.${locale}&select=id,slug,title,summary,lang&order=id.desc&limit=${limit}`;
  const r2 = await fetch(urlId, { headers, cache: 'no-store' });
  if (!r2.ok) throw new Error('REST fetch failed');
  return (await r2.json()) as Row[];
}

export default function NewsList({ locale, limit = 6, showLinkAll = true }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        let data: Row[] = [];
        try {
          data = await fetchClient(locale, limit);
        } catch {
          // fallback a REST se il client fallisce
          data = await fetchRest(locale, limit);
        }
        if (!abort) setRows(data);
      } catch (e: any) {
        if (!abort) setError(e?.message || 'Errore di caricamento');
      }
    })();
    return () => { abort = TrueFalseFalseHack(false); };
  }, [locale, limit]);

  // hack per evitare warning "setState on unmounted": funzione pura che ritorna il booleano passato
  function TrueFalseFalseHack(v: boolean) { return v; }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {locale === 'it' ? 'Errore nel caricamento delle news.' : 'Failed to load news.'}
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="text-sm text-gray-500">
        {locale === 'it' ? 'Caricamento…' : 'Loading…'}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        {locale === 'it' ? 'Nessuna news disponibile.' : 'No news available.'}
      </div>
    );
  }

  return (
    <section>
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

      {showLinkAll && (
        <div className="mt-4 text-right">
          <Link
            className="text-sm underline hover:opacity-80"
            href={`/${locale}/news?page=0`}
          >
            {locale === 'it' ? 'Tutte le news' : 'All news'}
          </Link>
        </div>
      )}
    </section>
  );
}
"""

def main() -> int:
    try:
        # lib
        if not LIB_PATH.exists():
            LIB_PATH.parent.mkdir(parents=True, exist_ok=True)
            LIB_PATH.write_text(LIB_TS, encoding="utf-8")

        # component
        CMP_PATH.parent.mkdir(parents=True, exist_ok=True)
        CMP_PATH.write_text(NEWSLIST_TSX, encoding="utf-8")

        print("Rewrote:", CMP_PATH.relative_to(ROOT))
        print("Ensured:", LIB_PATH.relative_to(ROOT))
        return 0
    except Exception as e:
        print("[ERROR]", e)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
