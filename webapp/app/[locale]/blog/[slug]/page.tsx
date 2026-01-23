// app/[locale]/blog/[slug]/page.tsx
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
  
  // 3. CERCA AUTORE
  let author = null;
  if (content.author_id) {
    const { data: authorData } = await supabase
      .from('authors')
      .select('*')
      .eq('id', content.author_id)
      .maybeSingle();
    
    author = authorData;
  }
  
  // 4. CERCA CATEGORIA PRIMARIA
  let primaryCategory = null;
  if (content.primary_category_id) {
    const { data: categoryData } = await supabase
      .from('category')
      .select('*')
      .eq('category_id', content.primary_category_id)
      .maybeSingle();
    
    primaryCategory = categoryData;
  }
  
  // 5. CERCA TUTTE LE CATEGORIE (MODIFICATO)
  const { data: allCategories } = await supabase
    .from('content_category')
    .select(`
      category:category_id (
        category_key,
        name
      )
    `)
    .eq('content_id', content.content_id);

  // Risolvi la struttura annidata correttamente
  const categories = allCategories?.map(cat => {
    // 'category' potrebbe essere un array o un oggetto
    const categoryObj = Array.isArray(cat.category) ? cat.category[0] : cat.category;
    return categoryObj;
  }).filter(Boolean) || [];

  // 6. CERCA TAG (MODIFICATO)
  const { data: tagsData } = await supabase
    .from('content_tag')
    .select(`
      tag:tag_id (
        tag_key,
        name
      )
    `)
    .eq('content_id', content.content_id);

  // RISOLVI CORRETTAMENTE LA STRUTTURA DEI TAG
  const tags = tagsData?.map(tagItem => {
    // 'tag' potrebbe essere un array o un oggetto
    const tagObj = Array.isArray(tagItem.tag) ? tagItem.tag[0] : tagItem.tag;
    return tagObj?.name;
  }).filter(Boolean) || [];

  console.log('🏷️ Tag trovati:', tags);
  
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

  const categoryLink = primaryCategory?.category_key 
    ? `/${locale}/blog?category=${primaryCategory.category_key}`
    : `/${locale}/blog`;

  console.log('✅ Dati completi recuperati!');
  console.log('📝 Titolo:', localization.title);
  console.log('🏷️ Categorie:', categories.length);
  console.log('🔤 Tag:', tags.length);

  // 8. RENDER
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {/* Categoria e tempo lettura */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {primaryCategory && (
            <>
              <Link 
                href={categoryLink}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
              >
                {translateCategory(primaryCategory.category_key)}
              </Link>
              <span>•</span>
            </>
          )}
          <span>{content.reading_time_min || 5} {t('minRead')}</span>
          <span>•</span>
          <span>{formatDate(content.published_at!)}</span>
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

        {/* Immagine cover */}
        {localization.cover_url || localization.image_url ? (
          <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={localization.cover_url || localization.image_url!}
              alt={localization.image_alt || localization.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
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
          {primaryCategory && (
            <Link 
              href={categoryLink}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Vedi tutti gli articoli in {translateCategory(primaryCategory.category_key)}
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