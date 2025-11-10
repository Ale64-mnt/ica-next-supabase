// webapp/app/lib/supabase/news-queries.ts
import { createClient } from './server';

export async function getLatestNews(locale: string, limit: number = 3) {
  const supabase = createClient();
  
  const { data: news, error } = await supabase
    .from('news') // <-- CAMBIA DA 'alert' A 'news'
    .select('id, title, excerpt, image_url, thumb_url, slug, published_at, locale, image_alt, category') // <-- AGGIUNGI 'category'
    .eq('locale', locale)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return news || [];
}