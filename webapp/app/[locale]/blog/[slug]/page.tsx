// app/[locale]/blog/[slug]/page.tsx - AGGIORNATO
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import AlertMarkdown from '@/app/components/AlertMarkdown';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPostPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: { params: Promise<BlogPostPageProps['params']> }) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  
  const { data: localization, error } = await supabase
    .from('content_localization')
    .select('title, meta_title, meta_description, excerpt, cover_url, image_url, image_alt')
    .eq('slug', slug)
    .eq('locale', locale)
    .maybeSingle();

  if (!localization || error) {
    return { 
      title: 'Articolo non trovato',
      description: 'Il contenuto richiesto non è disponibile'
    };
  }

  return {
    title: localization.meta_title || localization.title,
    description: localization.meta_description || localization.excerpt,
    openGraph: {
      title: localization.meta_title || localization.title,
      description: localization.meta_description || localization.excerpt,
      images: localization.cover_url || localization.image_url 
        ? [{ 
            url: localization.cover_url || localization.image_url!, 
            alt: localization.image_alt || localization.title 
          }] 
        : [],
    },
  };
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

export default async function BlogPostPage({ params }: { params: Promise<BlogPostPageProps['params']> }) {
  const { locale, slug } = await params;
  
  console.log(`🔍 Pagina dettaglio - slug: "${slug}", locale: "${locale}"`);
  
  const t = await getTranslations('Blog');
  const supabase = await createClient();
  
  // 1. CERCA LA LOCALIZZAZIONE
  const { data: localization, error: locError } = await supabase
    .from('content_localization')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .maybeSingle();
  
  if (!localization || locError) {
    console.error('❌ Localizzazione non trovata');
    notFound();
  }
  
  // 2. CERCA IL CONTENUTO
  const { data: content, error: contentError } = await supabase
    .from('content')
    .select('*')
    .eq('content_id', localization.content_id)
    .eq('content_type', 'blog_post')
    .eq('status', 'published')
    .maybeSingle();
  
  if (!content || contentError) {
    console.error('❌ Contenuto non trovato o non pubblicato');
    notFound();
  }
  
    // 3. CERCA AUTORE (LOCALIZZATO: slug + locale)
    let author: any = null;

    if (content.author_id) {
      // 3a) ricava lo slug dall'id agganciato al contenuto
      const { data: baseAuthor } = await supabase
        .from('authors')
        .select('slug')
        .eq('id', content.author_id)
        .maybeSingle();
  
      const authorSlug = baseAuthor?.slug;
  
      if (authorSlug) {
        // 3b) prova autore nella lingua corrente
        const { data: aCurrent } = await supabase
          .from('authors')
          .select('*')
          .eq('slug', authorSlug)
          .eq('locale', locale)
          .maybeSingle();
  
        if (aCurrent) {
          author = aCurrent;
        } else {
          // 3c) fallback EN
          const { data: aEn } = await supabase
            .from('authors')
            .select('*')
            .eq('slug', authorSlug)
            .eq('locale', 'en')
            .maybeSingle();
  
          if (aEn) {
            author = aEn;
          } else {
            // 3d) fallback IT
            const { data: aIt } = await supabase
              .from('authors')
              .select('*')
              .eq('slug', authorSlug)
              .eq('locale', 'it')
              .maybeSingle();
  
            author = aIt ?? null;
          }
        }
      }
    }
  
  
  // 4. CERCA TUTTE LE CATEGORIE CON GERARCHIA
  const { data: categoriesData } = await supabase
    .from('content_category')
    .select(`
      category:category_id (
        category_id,
        category_key,
        name,
        parent_category_id
      )
    `)
    .eq('content_id', content.content_id);

  // Processa le categorie per ottenere gerarchia
  const categories = categoriesData?.map(catItem => {
    const category = Array.isArray(catItem.category) ? catItem.category[0] : catItem.category;
    return category;
  }).filter(Boolean) || [];

  // 5. CERCA MACRO-CATEGORIE PER LE SOTTOCATEGORIE
  let categoryWithParent = null;
  if (categories.length > 0) {
    const primaryCategory = categories[0];
    
    if (primaryCategory.parent_category_id) {
      // Se è una sottocategoria, trova la macro-categoria parent
      const { data: parentCategory } = await supabase
        .from('category')
        .select('category_key, name')
        .eq('category_id', primaryCategory.parent_category_id)
        .maybeSingle();
      
      categoryWithParent = {
        ...primaryCategory,
        parent_category_key: parentCategory?.category_key,
        parent_category_name: parentCategory?.name
      };
    } else {
      // Se è già una macro-categoria
      categoryWithParent = {
        ...primaryCategory,
        parent_category_key: null,
        parent_category_name: null
      };
    }
  }
  
  // 6. CERCA TAG
  const { data: tagsData } = await supabase
    .from('content_tag')
    .select(`
      tag:tag_id (
        tag_key,
        name
      )
    `)
    .eq('content_id', content.content_id);

  const tags = tagsData?.map(tagItem => {
    const tagObj = Array.isArray(tagItem.tag) ? tagItem.tag[0] : tagItem.tag;
    return tagObj?.name;
  }).filter(Boolean) || [];

  console.log('✅ Dati completi recuperati!');
  console.log('📝 Titolo:', localization.title);
  console.log('🏷️ Categorie trovate:', categories.length);
  console.log('🔤 Tag trovati:', tags.length);
  
  // 7. HELPER FUNCTIONS
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Data non disponibile';
    }
  };

  // Funzione per tradurre le categorie (nuova versione per gerarchie)
  const translateCategory = (categoryKey: string, type?: 'macro' | 'sub') => {
    // Determina automaticamente il tipo se non specificato
    const categoryType = type || (isMacroCategory(categoryKey) ? 'macro' : 'sub');
    
    // Traduzione i18n
    return t(`categories.${categoryType}.${categoryKey}`);
  };

  // Link alla categoria (usa la sottocategoria se esiste, altrimenti macro)
  const categoryLink = categoryWithParent?.category_key 
    ? `/${locale}/blog?category=${categoryWithParent.category_key}`
    : `/${locale}/blog`;

  // 8. RENDER
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {/* Breadcrumb categoria e metadati */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600 mb-4">
          {categoryWithParent && (
            <div className="flex items-center flex-wrap gap-2">
              {/* Breadcrumb gerarchico */}
              <div className="flex items-center gap-1.5">
                {categoryWithParent.parent_category_key ? (
                  <>
                    <Link 
                      href={`/${locale}/blog?category=${categoryWithParent.parent_category_key}`}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors text-sm"
                    >
                      {translateCategory(categoryWithParent.parent_category_key, 'macro')}
                    </Link>
                    <span className="text-gray-400">›</span>
                  </>
                ) : null}
                <Link 
                  href={categoryLink}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors font-medium"
                >
                  {translateCategory(
                    categoryWithParent.category_key,
                    categoryWithParent.parent_category_key ? 'sub' : 'macro'
                  )}
                </Link>
              </div>
              <span className="hidden sm:inline text-gray-400">•</span>
            </div>
          )}
          
          {/* Tempo lettura e data */}
          <div className="flex items-center gap-3">
            <span>{content.reading_time_min || 5} {t('minRead')}</span>
            <span className="text-gray-400">•</span>
            <span>{formatDate(content.published_at!)}</span>
          </div>
        </div>

        {/* Titolo */}
        <h1 className="text-4xl font-bold mb-4">{localization.title}</h1>
        
        {/* Estratto */}
        {localization.excerpt && (
          <p className="text-xl text-gray-600 mb-6">{localization.excerpt}</p>
        )}

        {/* Autore */}
        {author && (
          <div className="flex items-center gap-3 mb-8">
            {author.avatar_url && (
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={author.avatar_url}
                  alt={author.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <Link 
                href={`/${locale}/blog/author/${author.slug}`}
                className="font-semibold hover:text-blue-600 transition-colors"
              >
                {author.name}
              </Link>
              {author.title && (
                <p className="text-sm text-gray-500">{author.title}</p>
              )}
            </div>
          </div>
        )}

       {/* Immagine cover (RIDIMENSIONATA, RESPONSIVA) */}
{localization.cover_url || localization.image_url ? (
  <div className="mb-8 max-w-3xl mx-auto rounded-xl overflow-hidden bg-gray-100">
    <Image
      src={localization.cover_url || localization.image_url!}
      alt={localization.image_alt || localization.title}
      width={1200}
      height={675}
      className="w-full h-auto max-h-[420px] object-contain"
      priority
      sizes="(max-width: 768px) 100vw, 768px"
    />
  </div>
) : null}


      </header>

      {/* Contenuto */}
      <div className="prose prose-lg max-w-none">
        {localization.body_md ? (
          <AlertMarkdown content={localization.body_md} />
        ) : (
          <p className="text-gray-500 italic">Contenuto non disponibile</p>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Link utili */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {/* Link alla categoria */}
          {categoryWithParent && (
            <Link 
              href={categoryLink}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {categoryWithParent.parent_category_key ? (
  <>{t('view_all_articles_in')} {translateCategory(categoryWithParent.category_key, 'sub')}</>
) : (
  <>{t('view_all_articles_in')} {translateCategory(categoryWithParent.category_key, 'macro')}</>
)}
            </Link>
          )}
          
          {/* Torna al blog */}
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← {t('back_to_blog')}
          </Link>
        </div>
      </footer>
    </article>
  );
}

export const dynamic = 'force-dynamic';