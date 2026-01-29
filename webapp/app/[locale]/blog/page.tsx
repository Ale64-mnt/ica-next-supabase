// app/[locale]/blog/page.tsx
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import ArticleCard from '@/app/components/blog/ArticleCard';

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
}

interface ParentCategory {
  category_id: number;
  category_key: string;
  name: string;
}

interface Category {
  category_id: number;
  category_key: string;
  name: string;
  parent_category_id?: number | null;
  parent?: ParentCategory | null;
}

interface ContentCategoryRow {
  category: Category | null;
}

interface Content {
  content_id: number;
  published_at: string;
  reading_time_min?: number | null;
  status: string;
  author_id?: string | null;
  authors: Author[];
  content_category?: ContentCategoryRow[];
}

interface ContentLocalization {
  localization_id: number;
  locale: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  cover_url?: string | null;
  thumb_url?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  content: Content;
}

interface BlogPageProps {
  params: { locale: string };
  searchParams?: { category?: string };
}

function cleanLocale(locale: string): string {
  return locale.includes('-') ? locale.split('-')[0] : locale;
}

function extractCategories(article: ContentLocalization): Category[] {
  const rows = article.content.content_category ?? [];
  return rows.map((r) => r.category).filter((c): c is Category => Boolean(c));
}

function resolveCategoryLabel(
  t: (key: string) => string,
  categoryKey: string
) {
  const macroKey = `categories.macro.${categoryKey}`;
  const subKey = `categories.sub.${categoryKey}`;

  const has = (t as unknown as { has?: (k: string) => boolean }).has;

  if (has?.(macroKey)) return t(macroKey);
  if (has?.(subKey)) return t(subKey);

  return categoryKey;
}

async function resolveFilterLabel(
  t: (key: string) => string,
  categoryKey: string,
  supabase: any
) {
  const { data: row } = await supabase
    .from('category')
    .select(`
      category_key,
      parent:parent_category_id (
        category_key
      )
    `)
    .eq('category_key', categoryKey)
    .single();

  const parentKey = (row as any)?.parent?.category_key as string | undefined;

  if (parentKey) {
    const macroLabel = resolveCategoryLabel(t, parentKey);
    const subLabel = resolveCategoryLabel(t, categoryKey);
    return `${macroLabel} · ${subLabel}`;
  }

  return resolveCategoryLabel(t, categoryKey);
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = params;
  const category = searchParams?.category;
  const t = await getTranslations('Blog');
  const supabase = createClient();

  const cleanLocaleCode = cleanLocale(locale);

  const { data: localizations } = await supabase
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
        ),
        content_category:content_category (
          category:category_id (
            category_id,
            category_key,
            name,
            parent_category_id,
            parent:parent_category_id (
              category_id,
              category_key,
              name
            )
          )
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

  const filterLabel = category
    ? await resolveFilterLabel(t as any, category, supabase)
    : null;

  return (
    <div>
      {category && articles.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">{t('showing_category')} </span>
              <span className="font-semibold text-blue-700">{filterLabel}</span>
              <span className="ml-2 text-gray-500">
                ({articles.length} {t('articles')})
              </span>
            </div>
            <a href={`/${cleanLocaleCode}/blog`} className="text-sm text-blue-600 hover:text-blue-800">
              {t('clear_filter')}
            </a>
          </div>
        </div>
      )}

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => {
            const articleCleanLocale = cleanLocale(article.locale);
            const categories = extractCategories(article);

            return (
              <ArticleCard
                key={article.localization_id}
                article={{
                  id: article.content.content_id,
                  slug: article.slug,
                  title: article.title,
                  excerpt: article.excerpt ?? undefined,
                  cover_url: article.cover_url ?? undefined,
                  thumb_url: article.thumb_url ?? undefined,
                  image_url: article.image_url ?? undefined,
                  image_alt: article.image_alt ?? undefined,
                  published_at: article.content.published_at,
                  reading_time_min: article.content.reading_time_min ?? undefined,
                  locale: articleCleanLocale,
                  author: article.content.authors?.[0],
                  categories
                }}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {category ? t('no_posts_category') : t('no_posts')}
          </h3>
          <p className="text-gray-500 mb-4">
            {category ? t('no_posts_category_desc', { category }) : t('no_posts_desc')}
          </p>
        </div>
      )}
    </div>
  );
}

async function filterByCategory(
  articles: ContentLocalization[],
  categoryKey: string,
  supabase: any
) {
  try {
    const { data: selected, error: selErr } = await supabase
      .from('category')
      .select('category_id')
      .eq('category_key', categoryKey)
      .single();

    if (selErr || !selected) return [];

    const selectedId = selected.category_id;

    const { data: children, error: childErr } = await supabase
      .from('category')
      .select('category_id')
      .eq('parent_category_id', selectedId);

    if (childErr) return [];

    const categoryIds = [selectedId, ...(children ?? []).map((c: any) => c.category_id)];

    const { data: contentCategories, error: ccErr } = await supabase
      .from('content_category')
      .select('content_id')
      .in('category_id', categoryIds);

    if (ccErr || !contentCategories) return [];

    const allowedContentIds = new Set(contentCategories.map((cc: any) => cc.content_id));

    return articles.filter((article) => allowedContentIds.has(article.content.content_id));
  } catch (err) {
    console.error('❌ Errore filtro categoria:', err);
    return [];
  }
}
