# -*- coding: utf-8 -*-
"""
overwrite_newslist_clean.py
- Sovrascrive webapp/components/NewsList.tsx con una versione corretta (client-side).
- Garantisce la presenza di webapp/lib/supabaseBrowser.ts.
- Rimuove eventuali problemi causati da import errati o BOM/doppi 'use client'.

Idempotente: sempre scrittura della versione "buona".
Exit codes: 0 OK, 2 ERROR I/O.
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
CMP_PATH = WEBAPP / "components" / "NewsList.tsx"
LIB_PATH = WEBAPP / "lib" / "supabaseBrowser.ts"

LIB_TS = (
    "'use client';\n\n"
    "import { createBrowserClient } from '@supabase/ssr';\n\n"
    "export const supabaseBrowser = () =>\n"
    "  createBrowserClient(\n"
    "    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n"
    "    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n"
    "  );\n"
)

NEWSLIST_TSX = (
    "'use client';\n\n"
    "import { useEffect, useState } from 'react';\n"
    "import Link from 'next/link';\n"
    "import { supabaseBrowser } from '@/lib/supabaseBrowser';\n"
    "import ArticleCard from '@/components/ArticleCard';\n\n"
    "type Row = {\n"
    "  id: number;\n"
    "  slug: string;\n"
    "  title: string;\n"
    "  summary: string;\n"
    "  lang: string;\n"
    "  created_at?: string | null;\n"
    "};\n\n"
    "type Props = {\n"
    "  locale: 'it' | 'en';\n"
    "  limit?: number;         // default 6\n"
    "  showLinkAll?: boolean;  // mostra link \"Tutte le news\"\n"
    "};\n\n"
    "async function fetchClient(locale: string, limit: number): Promise<Row[]> {\n"
    "  const sb = supabaseBrowser();\n"
    "  const tryCreated = await sb\n"
    "    .from('news')\n"
    "    .select('id,slug,title,summary,lang,created_at')\n"
    "    .eq('lang', locale)\n"
    "    .order('created_at', { ascending: false })\n"
    "    .limit(limit);\n"
    "  if (!tryCreated.error && tryCreated.data) return tryCreated.data as Row[];\n"
    "  const fallback = await sb\n"
    "    .from('news')\n"
    "    .select('id,slug,title,summary,lang')\n"
    "    .eq('lang', locale)\n"
    "    .order('id', { ascending: false })\n"
    "    .limit(limit);\n"
    "  if (fallback.error) throw fallback.error;\n"
    "  return fallback.data as Row[];\n"
    "}\n\n"
    "async function fetchRest(locale: string, limit: number): Promise<Row[]> {\n"
    "  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;\n"
    "  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;\n"
    "  const headers: Record<string, string> = { apikey: anon, Authorization: `Bearer ${anon}` } as any;\n"
    "  const urlCreated = `${base}/rest/v1/news?lang=eq.${locale}&select=id,slug,title,summary,lang,created_at&order=created_at.desc&limit=${limit}`;\n"
    "  const r1 = await fetch(urlCreated, { headers, cache: 'no-store' });\n"
    "  if (r1.ok) return (await r1.json()) as Row[];\n"
    "  const urlId = `${base}/rest/v1/news?lang=eq.${locale}&select=id,slug,title,summary,lang&order=id.desc&limit=${limit}`;\n"
    "  const r2 = await fetch(urlId, { headers, cache: 'no-store' });\n"
    "  if (!r2.ok) throw new Error('REST fetch failed');\n"
    "  return (await r2.json()) as Row[];\n"
    "}\n\n"
    "export default function NewsList({ locale, limit = 6, showLinkAll = true }: Props) {\n"
    "  const [rows, setRows] = useState<Row[] | null>(null);\n"
    "  const [error, setError] = useState<string | null>(null);\n\n"
    "  useEffect(() => {\n"
    "    let abort = false;\n"
    "    (async () => {\n"
    "      try {\n"
    "        let data: Row[] = [];\n"
    "        try { data = await fetchClient(locale, limit); }\n"
    "        catch { data = await fetchRest(locale, limit); }\n"
    "        if (!abort) setRows(data);\n"
    "      } catch (e: any) {\n"
    "        if (!abort) setError(e?.message || 'Errore di caricamento');\n"
    "      }\n"
    "    })();\n"
    "    return () => { abort = false; };\n"
    "  }, [locale, limit]);\n\n"
    "  if (error) {\n"
    "    return (\n"
    "      <div className=\"rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800\">\n"
    "        {locale === 'it' ? 'Errore nel caricamento delle news.' : 'Failed to load news.'}\n"
    "      </div>\n"
    "    );\n"
    "  }\n\n"
    "  if (!rows) {\n"
    "    return (\n"
    "      <div className=\"text-sm text-gray-500\">\n"
    "        {locale === 'it' ? 'Caricamento…' : 'Loading…'}\n"
    "      </div>\n"
    "    );\n"
    "  }\n\n"
    "  if (rows.length === 0) {\n"
    "    return (\n"
    "      <div className=\"text-sm text-gray-600\">\n"
    "        {locale === 'it' ? 'Nessuna news disponibile.' : 'No news available.'}\n"
    "      </div>\n"
    "    );\n"
    "  }\n\n"
    "  return (\n"
    "    <section>\n"
    "      <div className=\"grid gap-4 sm:grid-cols-2 lg:grid-cols-3\">\n"
    "        {rows.map((n) => (\n"
    "          <ArticleCard\n"
    "            key={`${n.lang}:${n.slug}`}\n"
    "            href={`/${n.lang}/news/${encodeURIComponent(n.slug)}`}\n"
    "            title={n.title}\n"
    "            summary={n.summary}\n"
    "          />\n"
    "        ))}\n"
    "      </div>\n\n"
    "      {showLinkAll && (\n"
    "        <div className=\"mt-4 text-right\">\n"
    "          <Link className=\"text-sm underline hover:opacity-80\" href={`/${locale}/news?page=0`}>\n"
    "            {locale === 'it' ? 'Tutte le news' : 'All news'}\n"
    "          </Link>\n"
    "        </div>\n"
    "      )}\n"
    "    </section>\n"
    "  );\n"
    "}\n"
)

def main() -> int:
    try:
        # assicura la lib
        if not LIB_PATH.exists():
            LIB_PATH.parent.mkdir(parents=True, exist_ok=True)
            LIB_PATH.write_text(LIB_TS, encoding="utf-8")
        # sovrascrive il componente con versione pulita (niente BOM, import corretto)
        CMP_PATH.parent.mkdir(parents=True, exist_ok=True)
        CMP_PATH.write_text(NEWSLIST_TSX, encoding="utf-8")
        print(f"[OK] Rewrote {CMP_PATH.relative_to(ROOT)}")
        print(f"[OK] Ensured {LIB_PATH.relative_to(ROOT)}")
        return 0
    except Exception as e:
        print(f"[ERROR] {e}")
        return 2

if __name__ == '__main__':
    raise SystemExit(main())
