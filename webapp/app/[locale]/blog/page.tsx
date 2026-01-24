// app/[locale]/blog/page.tsx - VERSIONE CON GERARCHIE
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import CategoryHierarchy from '@/app/components/blog/CategoryHierarchy';

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
    parent_category_id?: number;
  };
}

// Tipi per la gerarchia delle categorie
interface CategoryNode {
  category_id: number;
  category_key: string;
  name: string;
  count: number;
  children: CategoryNode[];
}

interface CategoryFromDB {
  category_id: number;
  category_key: string;
  name: string;
  parent_category_id?: number;
  scope: string;
}

// Helper per identificare macro-categorie
const MACRO_CATEGORIES = [
  'digital-safety',
  'digital-education', 
  'digital-ethics',
  'eu-updates'
];

const isMacroCategory = (categoryKey: string): boolean => {
  return MACRO_CATEGORIES.includes(categoryKey);
};

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
  // 1. QUERY PRINCIPALE
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
  // 3. RECUPERA E ORGANIZZA DATI
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
  let categoryHierarchy: CategoryNode[] = [];
  
  if (sortedLocalizations && sortedLocalizations.length > 0) {
    // Estrai gli ID dei contenuti
    const contentIds = sortedLocalizations
      .map(loc => loc.content?.content_id)
      .filter((id): id is number => id !== undefined);
    
    console.log('📋 Content IDs trovati:', contentIds);
    
    // 3A. Recupera categorie con gerarchia
    const { data: allCategories } = await supabase
      .from('category')
      .select(`
        category_id,
        category_key,
        name,
        parent_category_id,
        scope
      `)
      .eq('scope', 'project') as { data: CategoryFromDB[] | null };
    
    // 3B. Recupera associazioni articolo-categoria
    const { data: contentCategories } = await supabase
      .from('content_category')
      .select(`
        content_id,
        category:category_id (
          category_key,
          name,
          parent_category_id
        )
      `)
      .in('content_id', contentIds) as { data: ContentCategory[] | null };
    
    console.log('🏷️ Categorie trovate:', contentCategories?.length || 0);
    
    // 3C. Combina i dati
    postsWithDetails = sortedLocalizations.map(loc => {
      const postCategories = contentCategories?.filter(
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
    
    // 3D. Costruisci gerarchia categorie con conteggio CORRETTO
    if (allCategories) {
      // Conta articoli per categoria (incluse macro)
      const categoryCounts: Record<string, number> = {};
      
      // Prima conta per ogni categoria direttamente
      postsWithDetails.forEach(post => {
        post.content_category.forEach(catItem => {
          if (catItem.category?.category_key) {
            const key = catItem.category.category_key;
            categoryCounts[key] = (categoryCounts[key] || 0) + 1;
          }
        });
      });
      
      // Ora propaga i conteggi dalle sottocategorie alle macro-categorie
      allCategories.forEach(cat => {
        if (cat.parent_category_id) {
          // Se è una sottocategoria, trova la macro e aggiungi il conteggio
          const parentCategory = allCategories.find(c => c.category_id === cat.parent_category_id);
          if (parentCategory && categoryCounts[cat.category_key]) {
            categoryCounts[parentCategory.category_key] = 
              (categoryCounts[parentCategory.category_key] || 0) + categoryCounts[cat.category_key];
          }
        }
      });
      
      // Organizza in gerarchia
      const categoryMap = new Map<number, CategoryNode>();
      const rootCategories: CategoryNode[] = [];
      
      // Crea nodi base
      allCategories.forEach(cat => {
        const node: CategoryNode = {
          category_id: cat.category_id,
          category_key: cat.category_key,
          name: cat.name,
          count: categoryCounts[cat.category_key] || 0,
          children: []
        };
        categoryMap.set(cat.category_id, node);
        
        if (!cat.parent_category_id) {
          rootCategories.push(node);
        }
      });
      
      // Collega figli ai parent
      allCategories.forEach(cat => {
        if (cat.parent_category_id) {
          const parent = categoryMap.get(cat.parent_category_id);
          const child = categoryMap.get(cat.category_id);
          if (parent && child) {
            parent.children.push(child);
          }
        }
      });
      
      // Ordina per count
      rootCategories.sort((a, b) => b.count - a.count);
      rootCategories.forEach(cat => {
        if (cat.children) {
          cat.children.sort((a, b) => b.count - a.count);
        }
      });
      
      categoryHierarchy = rootCategories;
      
      // DEBUG: Log dei conteggi
      console.log('📊 Conteggi categorie:');
      categoryHierarchy.forEach(macro => {
        console.log(`  ${macro.category_key}: ${macro.count} articoli`);
        if (macro.children) {
          macro.children.forEach(sub => {
            console.log(`    └─ ${sub.category_key}: ${sub.count} articoli`);
          });
        }
      });
    }
    
    console.log('✅ Dati combinati:', postsWithDetails.length, 'articoli');
    console.log('🌳 Gerarchia categorie:', categoryHierarchy.length, 'macro-categorie');
    
    // Log degli articoli trovati
    postsWithDetails.forEach((post) => {
      const slug = post.content_localization[0]?.slug;
      console.log(`🔗 Articolo ${post.content_id}: /${locale}/blog/${slug}`);
    });
  }
  
  // ============================================
  // 4. FILTRA ARTICOLI PER CATEGORIA SELEZIONATA
  // ============================================
  let filteredPosts = postsWithDetails;
  if (category) {
    const isSelectedMacro = isMacroCategory(category);
    
    filteredPosts = postsWithDetails.filter(post => {
      return post.content_category.some(catItem => {
        const catKey = catItem.category?.category_key;
        if (!catKey) return false;
        
        if (isSelectedMacro) {
          // Se selezionata macro, cerca tra le sue sottocategorie
          const macroCat = categoryHierarchy.find(macro => macro.category_key === category);
          if (!macroCat) return false;
          
          return macroCat.children?.some((child: CategoryNode) => child.category_key === catKey) || 
                 catKey === category;
        } else {
          // Se selezionata sottocategoria, solo quella specifica
          return catKey === category;
        }
      });
    });
    
    console.log(`🔍 Filtro categoria "${category}": ${filteredPosts.length} articoli`);
  }
  
  // ============================================
  // 5. HELPER FUNCTIONS
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
    const cat = post.content_category[0].category;
    if (!cat) return null;
    
    // Trova la macro-categoria parent
    const macroCat = categoryHierarchy.find(macro => 
      macro.children?.some((child: CategoryNode) => child.category_key === cat.category_key)
    );
    
    return {
      ...cat,
      parent_category_key: macroCat?.category_key,
      parent_category_name: macroCat?.name
    };
  };
  
  // Funzione per tradurre le categorie (versione corretta)
  const translateCategory = (categoryKey: string, type?: 'macro' | 'sub') => {
    // Se type non è specificato, determina automaticamente
    const categoryType = type || (isMacroCategory(categoryKey) ? 'macro' : 'sub');
    
    // Prova la traduzione i18n
    const translated = t(`categories.${categoryType}.${categoryKey}`);
    
    // Se la traduzione esiste (non restituisce il percorso stesso)
    if (translated && !translated.startsWith('categories.')) {
      return translated;
    }
    
    // Fallback: usa il nome dal database o formatta la chiave
    const category = categoryHierarchy.flatMap(cat => [cat, ...(cat.children || [])])
      .find(c => c.category_key === categoryKey);
    
    return category?.name || categoryKey.replace(/-/g, ' ');
  };
  
  // ============================================
  // 6. RENDER
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
          {/* Header con categoria selezionata */}
          {category && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">{t('showing_category')}</span>
                <span className="ml-2 font-semibold text-blue-700">
                  {translateCategory(category)}
                </span>
                <span className="ml-2 text-gray-500">({filteredPosts.length} articoli)</span>
              </div>
              <Link href={`/${locale}/blog`} className="text-sm text-blue-600 hover:text-blue-800">
                {t('clear_filter')}
              </Link>
            </div>
          )}
          
          {/* Lista Articoli */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredPosts.map((post, index) => {
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
                      {/* CATEGORIA CON GERARCHIA */}
                      {categoryInfo && (
                        <div className="mb-4">
                          <Link 
                            href={`/${locale}/blog?category=${categoryInfo.category_key}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200 hover:bg-blue-200 transition-colors group"
                          >
                            {categoryInfo.parent_category_key && (
                              <>
                                <span className="opacity-80 group-hover:opacity-100">
                                  {translateCategory(categoryInfo.parent_category_key, 'macro')}
                                </span>
                                <span className="mx-1.5 opacity-60">›</span>
                              </>
                            )}
                            <span>{translateCategory(categoryInfo.category_key, 'sub')}</span>
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
        
        {/* SIDEBAR CON GERARCHIA */}
        <div className="lg:w-1/3">
          <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <CategoryHierarchy
              categories={categoryHierarchy}
              currentLocale={locale}
              selectedCategory={category}
              selectedSubCategory={category && !isMacroCategory(category) ? category : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}