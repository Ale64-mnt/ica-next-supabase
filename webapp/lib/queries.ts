// webapp/lib/queries.ts
import { createClient } from '@supabase/supabase-js';

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  excerpt?: string | null;
  cover_url?: string | null;
  category?: string | null;
  locale?: string | null;
  published?: boolean | null;
  published_at?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Ritorna gli articoli pubblicati (con RLS attiva l'anon vede solo published=TRUE e
 * i locale permessi).
 */
export async function fetchArticles(limit = 20) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, summary, cover_url, category, locale, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Article[];
}

/** Ritorna un articolo per id (se pubblicato e visibile per RLS). */
export async function fetchArticleById(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, summary, cover_url, category, locale, published_at')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Article | null;
}
