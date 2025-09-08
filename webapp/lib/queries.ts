import { createClient } from './supabaseClient'
const supabase = createClient()

export async function fetchNews(lang = 'it') {
  const { data, error } = await supabase
    .from('news')
    .select('id,title,source,source_date,summary,image_url,lang,created_at')
    .eq('lang', lang).eq('published', true)
    .order('source_date', { ascending: false })
    .limit(25)
  if (error) throw error
  return data ?? []
}

export async function fetchNewsById(id: string) {
  const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function fetchArticles(lang = 'it') {
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,subtitle,image_url,lang,created_at')
    .eq('lang', lang).eq('published', true)
    .order('created_at', { ascending: false })
    .limit(25)
  if (error) throw error
  return data ?? []
}

export async function fetchArticleById(id: string) {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
