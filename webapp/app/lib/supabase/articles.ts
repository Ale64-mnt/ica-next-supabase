// webapp/app/lib/supabase/articles.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  lang: string;
  locale: string;
  image_url?: string;
  thumb_url?: string;
  cover_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}



// ✅ AGGIUNGI QUESTA FUNZIONE MANCANTE
export async function getLatestArticles(locale: string, limit = 5): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .or(`locale.eq.${locale},locale.eq.multilingual`) // ✅ CERCA SIA LOCALE CHE MULTILINGUAL
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Errore nel recupero articoli:', error);
    return [];
  }

  return data || [];
}