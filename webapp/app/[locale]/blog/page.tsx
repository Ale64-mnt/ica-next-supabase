// app/[locale]/blog/page.tsx - VERSIONE SENZA SIDEBAR (gestita dal layout)
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import ArticleCard from '@/app/components/blog/ArticleCard';

// INTERFACCE TYPESCRIPT
interface Author {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
}

interface Content {
  content_id: number;
  published_at: string;
  reading_time_min?: number;
  status: string;
  author_id?: string;
  authors: Author[];
}

interface ContentLocalization {
  localization_id: number;
  locale: string;
  slug: string;
  title: string;
  excerpt?: string;
  cover_url?: string;
  thumb_url?: string;
  image_url?: string;
  image_alt?: string;
  content: Content;
}

interface BlogPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    category?: string;
  };
}

// Helper per pulire locale (fr-FR → fr)
function cleanLocale(locale: string): string {
  return locale.includes('-') ? locale.split('-')[0] : locale;
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = params;
  const category = searchParams?.category;
  const t = await getTranslations('Blog');
  const supabase = createClient();

  const cleanLocaleCode = cleanLocale(locale);

  const { data: localizations, error } = await supabase
    .from('content_localization')
    .select(`
      localization_id,
      locale,
      slug,
      title,
      excerpt,
      cover_url,
      thumb_url,
      image_url,
      image_alt,
      content:content_id!inner (
        content_id,
        published_at,
        reading_time_min,
        status,
        author_id,
        authors:author_id (
          id,
          name,
          slug,
          avatar_url
        )
      )
    `)
    .or(`locale.eq.${cleanLocaleCode},locale.eq.${cleanLocaleCode}-${cleanLocaleCode.toUpperCase()}`)
    .eq('content.status', 'published')
    .lt('content.published_at', new Date().toISOString());

  const typedLocalizations = (localizations as ContentLocalization[] | null) ?? [];

  const sortedLocalizations = [...typedLocalizations].sort((a, b) => {
    const dateA = new Date(a.content.published_at).getTime();
    const dateB = new Date(b.content.published_at).getTime();
    return dateB - dateA;
  });

  let articles = sortedLocalizations;

  if (category && articles.length > 0) {
    articles = await filterByCategory(articles, category, supabase);
  }

  return (
    <div>
      {/* Header con categoria */}
      {category && articles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">{t('showing_category')}: </span>
              <span className="font-semibold text-blue-700">{category}</span>
              <span className="ml-2 text-gray-500">({articles.length} {t('articles')})</span>
            </div>
            <a href={`/${cleanLocaleCode}/blog`} className="text-sm text-blue-600 hover:text-blue-800">
              {t('clear_filter')}
            </a>
          </div>
        </div>
      )}

      {/* Lista articoli */}
      {articles.length > 0 ? (
        <>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <p className="font-medium text-green-800">
                  {articles.length} articoli trovati
                </p>
                <p className="text-sm text-green-600">
                  Locale: {locale} (cerca: {cleanLocaleCode})
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article) => {
              const articleCleanLocale = cleanLocale(article.locale);

              return (
                <ArticleCard
                  key={article.localization_id}
                  article={{
                    id: article.content.content_id,
                    slug: article.slug,
                    title: article.title,
                    excerpt: article.excerpt,
                    cover_url: article.cover_url,
                    thumb_url: article.thumb_url,
                    image_url: article.image_url,
                    image_alt: article.image_alt,
                    published_at: article.content.published_at,
                    reading_time_min: article.content.reading_time_min || 5,
                    locale: articleCleanLocale,
                    author: article.content.authors?.[0],
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {category ? t('no_posts_category') : t('no_posts')}
          </h3>
          <p className="text-gray-500 mb-4">
            {category
              ? `Nessun articolo trovato per la categoria "${category}".`
              : 'Nessun articolo pubblicato ancora.'}
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-medium text-gray-700 mb-2">Debug Info:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Route locale:</strong> {locale}</p>
              <p><strong>Clean locale:</strong> {cleanLocaleCode}</p>
              <p><strong>Articoli trovati:</strong> {localizations?.length || 0}</p>
              <p><strong>Errore:</strong> {error?.message || 'Nessuno'}</p>
              {localizations && localizations.length > 0 && (
                <>
                  <p className="mt-2"><strong>Articoli trovati:</strong></p>
                  <ul className="list-disc pl-4">
                    {localizations.slice(0, 3).map((loc: any, i: number) => (
                      <li key={i}>
                        {loc.title} (locale: {loc.locale}, slug: {loc.slug})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function per filtrare per categoria
async function filterByCategory(
  articles: ContentLocalization[],
  category: string,
  supabase: any
) {
  try {
    const { data: categoryData } = await supabase
      .from('category')
      .select('category_id')
      .eq('category_key', category)
      .single();

    if (!categoryData) return [];

    const { data: contentCategories } = await supabase
      .from('content_category')
      .select('content_id')
      .eq('category_id', categoryData.category_id);

    if (!contentCategories) return [];

    const categoryContentIds = contentCategories.map((cc: any) => cc.content_id);

    return articles.filter((article) =>
      categoryContentIds.includes(article.content.content_id)
    );
  } catch (err) {
    console.error('❌ Errore filtro categoria:', err);
    return [];
  }
}
