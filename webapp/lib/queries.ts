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

export type News = {
  id: string;
  title: string;
  summary?: string | null;
  cover_url?: string | null;
  slug?: string | null;
  locale?: string | null;
  published?: boolean | null;
  published_at?: string | null;
};

// client anonimo per letture con RLS attive
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* --------------------------- ARTICOLI --------------------------- */

export async function fetchArticles(limit = 20) {
  const { data, error } = await supabase
    .from('articles')
    .select('id,slug,title,excerpt,summary,cover_url,category,locale,published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Article[];
}

export async function fetchArticleById(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('id,slug,title,excerpt,summary,cover_url,category,locale,published_at')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Article | null;
}

/* ----------------------------- NEWS ----------------------------- */

export async function fetchNews(limit = 20) {
  const { data, error } = await supabase
    .from('news')
    .select('id,title,summary,cover_url,slug,locale,published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as News[];
}

export async function fetchNewsById(id: string) {
  const { data, error } = await supabase
    .from('news')
    .select('id,title,summary,cover_url,slug,locale,published_at')
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as News | null;
}
