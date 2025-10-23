// webapp/lib/supabase/blogQueries.ts
import { createSupabaseServerClient } from './supabaseServer'

// Query per Blog Posts
export async function getBlogPosts(locale: string = 'it') {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('locale', locale)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
  
  return data
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
  
  return data
}

// Query per Articles
export async function getArticles(locale: string = 'it', published: boolean = true) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('locale', locale)
    .eq('published', published)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }
  
  return data
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createSupabaseServerClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }
  
  return data
}