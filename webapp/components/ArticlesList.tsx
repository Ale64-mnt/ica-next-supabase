'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type SupportedLocale = 'it' | 'en';
type Props = { locale?: SupportedLocale };

type Article = {
  id: string;
  slug?: string | null;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
  locale?: string | null;
};

export default function ArticlesList({ locale }: Props) {
  const fallback = useLocale() as SupportedLocale;
  const loc: SupportedLocale = locale ?? fallback;

  const [data, setData] = useState<Article[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const supabase = supabaseBrowser();
        const { data, error } = await supabase
          .from('articles')
          .select('id,slug,title,excerpt,published_at,locale')
          .eq('published', true)
          // prendi contenuti della lingua corrente, con fallback a quelli senza locale
          .or(`locale.eq.${loc},locale.is.null`)
          .order('published_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (!alive) return;
        setData(data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Errore caricamento articoli');
      }
    })();

    return () => {
      alive = false;
    };
  }, [loc]);

  if (error) return <div style={{ color: 'crimson' }}>Errore nel caricamento degli articoli: {error}</div>;
  if (!data) return <div>Caricamento…</div>;
  if (data.length === 0) return <div>Nessun articolo disponibile.</div>;

  const fmt = new Intl.DateTimeFormat(loc === 'it' ? 'it-IT' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });

  return (
    <ul style={{ display: 'grid', gap: '0.75rem', padding: 0, listStyle: 'none' }}>
      {data.map((a) => {
        const date = a.published_at ? fmt.format(new Date(a.published_at)) : null;
        const body = (
          <>
            <div style={{ fontWeight: 600 }}>{a.title}</div>
            {date && (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {date}
              </div>
            )}
            {a.excerpt && <p style={{ marginTop: 6 }}>{a.excerpt}</p>}
          </>
        );

        // se abbiamo lo slug, link alla pagina di dettaglio localizzata
        return (
          <li key={a.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: '0.75rem', background: 'white' }}>
            {a.slug ? (
              <Link href={`/${loc}/blog/${a.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
