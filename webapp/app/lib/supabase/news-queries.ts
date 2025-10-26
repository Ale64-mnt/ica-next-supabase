import { createClient } from './server';

export async function getLatestNews(locale: string, limit: number = 3) {
  const supabase = createClient();
  
  const { data: news, error } = await supabase
    .from('alert')
    .select('id, title, excerpt, image_url, thumb_url, slug, published_at, locale, image_alt') // <-- AGGIUNGI thumb_url QUI
    .eq('locale', locale)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }

  return news || [];
}