// app/[locale]/blog/page.tsx - VERSIONE CORRETTA
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';

interface BlogPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    category?: string;
    page?: string;
  };
}

// Tipo per i dati della query
interface ContentLocalization {
  localization_id: number;
  locale: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_url?: string;
  thumb_url?: string;
  image_alt?: string;
  content: {
    content_id: number;
    content_key: string;
    content_type: string;
    status: string;
    published_at: string;
    reading_time_min?: number;
    view_count?: number;
    featured?: boolean;
    author_id?: string;
    authors: Array<{
      id: string;
      name: string;
      slug: string;
      avatar_url?: string;
    }>;
  };
}

interface ContentCategory {
  content_id: number;
  category: {
    category_key: string;
    name: string;
  };
}

export default async function BlogPage({ 
  params, 
  searchParams 
}: BlogPageProps) {
  const { locale } = params;
  const t = await getTranslations('Blog');
  const category = searchParams?.category;
  
  console.log(`🔍 Pagina blog - lingua: ${locale}`);
  
  const supabase = createClient();
  
  // ============================================
  // 1. QUERY PRINCIPALE SENZA ORDER PROBLEMATICO
  // ============================================
  console.log(`🎯 Query per: ${locale}`);
  
  const { data: localizations, error, count } = await supabase
    .from('content_localization')
    .select(`
      localization_id,
      locale,
      slug,
      title,
      excerpt,
      cover_url,
      thumb_url,
      image_alt,
      content:content_id (
        content_id,
        content_key,
        content_type,
        status,
        published_at,
        reading_time_min,
        view_count,
        featured,
        author_id,
        authors:author_id (
          id,
          name,
          slug,
          avatar_url
        )
      )
    `)
    .eq('locale', locale)
    .eq('content.status', 'published')
    .eq('content.content_type', 'blog_post') as { 
      data: ContentLocalization[] | null; 
      error: any; 
      count: number | null 
    };
  
  console.log('📊 Risultati query base:', { 
    count: localizations?.length || 0, 
    error: error?.message 
  });
  console.log('📝 Localizzazioni trovate:', localizations?.length || 0);
  
  // ============================================
  // 2. ORDINA MANUALMENTE I RISULTATI
  // ============================================
  let sortedLocalizations = localizations;
  if (sortedLocalizations && sortedLocalizations.length > 0) {
    sortedLocalizations = [...sortedLocalizations].sort((a, b) => {
      try {
        const dateA = new Date(a.content.published_at).getTime();
        const dateB = new Date(b.content.published_at).getTime();
        return dateB - dateA; // Più recente prima
      } catch {
        return 0;
      }
    });
    console.log('📅 Articoli ordinati per data di pubblicazione');
  }
  
  // ============================================
  // 3. RECUPERA DATI AGGIUNTIVI (usa sortedLocalizations)
  // ============================================
  interface PostWithDetails {
    content_id: number;
    content_key: string;
    content_type: string;
    status: string;
    published_at: string;
    reading_time_min?: number;
    view_count?: number;
    featured?: boolean;
    author_id?: string;
    authors: Array<{
      id: string;
      name: string;
      slug: string;
      avatar_url?: string;
    }>;
    content_localization: Array<{
      localization_id: number;
      locale: string;
      slug: string;
      title: string;
      excerpt?: string;
      cover_url?: string;
      thumb_url?: string;
      image_alt?: string;
    }>;
    content_category: ContentCategory[];
  }
  
  let postsWithDetails: PostWithDetails[] = [];
  
  if (sortedLocalizations && sortedLocalizations.length > 0) {
    // Estrai gli ID dei contenuti
    const contentIds = sortedLocalizations
      .map(loc => loc.content?.content_id)
      .filter((id): id is number => id !== undefined);
    
    console.log('📋 Content IDs trovati:', contentIds);
    
    // 3A. Recupera categorie
    const { data: categories } = await supabase
      .from('content_category')
      .select(`
        content_id,
        category:category_id (
          category_key,
          name
        )
      `)
      .in('content_id', contentIds) as { data: ContentCategory[] | null };
    
    console.log('🏷️ Categorie trovate:', categories?.length || 0);
    
    // 3B. Combina i dati con tipo sicuro
    postsWithDetails = sortedLocalizations.map(loc => {
      const postCategories = categories?.filter(
        (cat: ContentCategory) => cat.content_id === loc.content.content_id
      ) || [];
      
      return {
        // Dati dal content
        content_id: loc.content.content_id,
        content_key: loc.content.content_key,
        content_type: loc.content.content_type,
        status: loc.content.status,
        published_at: loc.content.published_at,
        reading_time_min: loc.content.reading_time_min,
        view_count: loc.content.view_count,
        featured: loc.content.featured,
        author_id: loc.content.author_id,
        authors: loc.content.authors || [],
        
        // Dati dalla localizzazione
        content_localization: [{
          localization_id: loc.localization_id,
          locale: loc.locale,
          slug: loc.slug,
          title: loc.title,
          excerpt: loc.excerpt,
          cover_url: loc.cover_url,
          thumb_url: loc.thumb_url,
          image_alt: loc.image_alt
        }],
        
        // Categorie
        content_category: postCategories
      };
    });
    
    console.log('✅ Dati combinati:', postsWithDetails.length, 'articoli');
    
    // Log degli articoli trovati
    postsWithDetails.forEach((post) => {
      const slug = post.content_localization[0]?.slug;
      console.log(`🔗 Articolo ${post.content_id}: /${locale}/blog/${slug}`);
    });
  }
  

  
  // ============================================
  // 3. HELPER FUNCTIONS
  // ============================================
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Data non disponibile';
    }
  };
  
  const getAuthor = (post: PostWithDetails) => {
    return post.authors?.[0] || null;
  };
  
  const getCategory = (post: PostWithDetails) => {
    if (!post.content_category?.length) return null;
    return post.content_category[0].category || null;
  };
  
  // Funzione per tradurre le categorie
  const translateCategory = (categoryKey: string) => {
    const categoriesTranslations = {
      'financial-education-eu': t('categories.financial-education-eu'),
      'cybersecurity-frauds': t('categories.cybersecurity-frauds'),
      'digital-ethics': t('categories.digital-ethics'),
      'eu-updates': t('categories.eu-updates'),
      'company-news': t('categories.company-news'),
      'practical-guides_cybersecurity-frauds': t('categories.practical-guides_cybersecurity-frauds'),
      'multilingual-education': t('categories.multilingual-education'),
    };
    
    return categoriesTranslations[categoryKey as keyof typeof categoriesTranslations] || categoryKey;
  };
  
  // ============================================
  // 4. CATEGORIE PER FILTRI
  // ============================================
  const { data: allCategories } = await supabase
    .from('category')
    .select('category_key, name')
    .order('name');
  
  // Conta articoli per categoria
  const categoriesCount: Record<string, number> = {};
  postsWithDetails.forEach(post => {
    post.content_category.forEach(catItem => {
      if (catItem.category?.category_key) {
        const key = catItem.category.category_key;
        categoriesCount[key] = (categoriesCount[key] || 0) + 1;
      }
    });
  });
  
  const categories = (allCategories || []).map(cat => ({
    key: cat.category_key,
    name: cat.name,
    count: categoriesCount[cat.category_key] || 0
  })).filter(cat => cat.count > 0);
  
  // ============================================
  // 5. RENDER
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Contenuto Principale */}
        <div className="lg:w-2/3">
          {category && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">{t('showing_category')}</span>
                <span className="ml-2 font-semibold text-blue-700">
                  {translateCategory(category)}
                </span>
                <span className="ml-2 text-gray-500">({postsWithDetails.length} articoli)</span>
              </div>
              <Link href={`/${locale}/blog`} className="text-sm text-blue-600 hover:text-blue-800">
                {t('clear_filter')}
              </Link>
            </div>
          )}
          
          {/* Lista Articoli */}
          {postsWithDetails.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {postsWithDetails.map((post, index) => {
                const localization = post.content_localization[0];
                const categoryInfo = getCategory(post);
                const author = getAuthor(post);
                
                return (
                  <article key={post.content_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
                    {/* IMMAGINE */}
                    <Link href={`/${locale}/blog/${localization.slug}`} className="flex-shrink-0">
                      <div className="relative h-64 w-full overflow-hidden">
                        {localization.cover_url || localization.thumb_url ? (
                          <Image
                            src={(localization.cover_url || localization.thumb_url)!}
                            alt={localization.image_alt || localization.title || ''}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={index === 0}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-4xl">📄</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-7 flex-grow flex flex-col">
                      {/* CATEGORIA */}
                      {categoryInfo && (
                        <div className="mb-4">
                          <Link 
                            href={`/${locale}/blog?category=${categoryInfo.category_key}`}
                            className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200 hover:bg-blue-200 transition-colors"
                          >
                            {translateCategory(categoryInfo.category_key)}
                          </Link>
                        </div>
                      )}
                      
                      {/* TITOLO */}
                      <h2 className="text-2xl font-bold mb-4 hover:text-blue-600 transition-colors">
                        <Link href={`/${locale}/blog/${localization.slug}`} className="line-clamp-2">
                          {localization.title}
                        </Link>
                      </h2>
                      
                      {/* ESTRATTO */}
                      {localization.excerpt && (
                        <p className="text-gray-700 mb-5 line-clamp-3 flex-grow text-base leading-relaxed">
                          {localization.excerpt}
                        </p>
                      )}
                      
                      {/* METADATI */}
                      <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mt-4 pt-5 border-t border-gray-100 gap-2">
                        <div className="flex items-center gap-4">
                          <time dateTime={post.published_at} className="flex items-center gap-1 whitespace-nowrap">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(post.published_at)}
                          </time>
                          {post.reading_time_min && (
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {post.reading_time_min} {t('minRead')}
                            </span>
                          )}
                        </div>
                        
                        {author && (
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <span className="text-xs text-gray-500">{t('by')}</span>
                            <Link 
                              href={`/${locale}/blog/author/${author.slug}`}
                              className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {author.name}
                            </Link>
                          </div>
                        )}
                      </div>
                      
                      {/* Link Leggi di più */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link
                          href={`/${locale}/blog/${localization.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-base group"
                        >
                          {t('readMore')}
                          <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-xl text-gray-600 mb-4">
                {error ? t('error_loading') : t('no_posts')}
              </p>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg mb-4 max-w-md mx-auto">
                  <p className="font-medium">Errore nel caricamento:</p>
                  <p className="mt-1">{error.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* SIDEBAR */}
        <div className="lg:w-1/3">
          <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
              {t('filter_by_category')}
            </h3>
            
            <div className="space-y-3">
              <Link
                href={`/${locale}/blog`}
                className={`flex justify-between items-center px-5 py-4 rounded-xl transition-all duration-200 ${
                  !category 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold">{t('all_categories')}</span>
                <span className="text-sm bg-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                  {postsWithDetails.length}
                </span>
              </Link>
              
              {categories.map((cat) => (
                <Link
                  key={cat.key}
                  href={`/${locale}/blog?category=${cat.key}`}
                  className={`flex justify-between items-center px-5 py-4 rounded-xl transition-all duration-200 ${
                    category === cat.key
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{translateCategory(cat.key)}</span>
                  <span className="text-sm bg-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}