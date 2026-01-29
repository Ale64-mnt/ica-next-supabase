// app/components/blog/ArticleCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
}

interface Category {
  category_key: string;
  name: string;
  parent_category_id?: number | null;
}

interface ArticleCardProps {
  article: {
    id: string | number;
    slug: string;
    title: string;
    excerpt?: string;
    cover_url?: string;
    thumb_url?: string;
    image_url?: string;
    image_alt?: string;
    published_at: string;
    reading_time_min?: number;
    locale: string;
    author?: Author;

    // supporto singola + multipla
    category?: Category;
    categories?: Category[];
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const t = useTranslations("Blog");

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(article.locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const href = `/${article.locale}/blog/${article.slug}`;
  const imageUrl = article.cover_url || article.image_url || article.thumb_url;
  const imageAlt = article.image_alt || article.title;

  const categories: Category[] =
    article.categories && article.categories.length > 0
      ? article.categories
      : article.category
        ? [article.category]
        : [];

  const visibleCategories = categories.slice(0, 3);

  /**
   * Risoluzione label categoria:
   * 1) Blog.categories.macro.<key>
   * 2) Blog.categories.sub.<key>
   * 3) fallback: name dal DB
   */
  const getCategoryLabel = (key: string, fallback: string) => {
    const macroKey = `categories.macro.${key}`;
    const subKey = `categories.sub.${key}`;

    const has = (t as unknown as { has?: (k: string) => boolean }).has;

    if (has?.(macroKey)) return t(macroKey);
    if (has?.(subKey)) return t(subKey);

    return fallback;
  };

  return (
    <article className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Immagine */}
      <Link
        href={href}
        className="block flex-shrink-0 relative h-56 overflow-hidden"
        aria-label={`Leggi articolo: ${article.title}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📄</span>
          </div>
        )}
      </Link>

      <div className="p-6 flex-grow flex flex-col">
        {/* CATEGORIE (TRADOTTE COME SIDEBAR) */}
        {visibleCategories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {visibleCategories.map((c) => (
              <Link
                key={c.category_key}
                href={`/${article.locale}/blog?category=${encodeURIComponent(c.category_key)}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full hover:bg-blue-200 transition-colors"
                title={c.category_key}
              >
                {getCategoryLabel(c.category_key, c.name)}
              </Link>
            ))}
          </div>
        )}

        {/* Metadati */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <time dateTime={article.published_at} className="flex items-center gap-1">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            {formatDate(article.published_at)}
          </time>

          {article.reading_time_min && (
            <>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {article.reading_time_min} {t("minRead")}
              </span>
            </>
          )}
        </div>

        {/* Titolo */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={href}>{article.title}</Link>
        </h2>

        {/* Estratto */}
        {article.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
            {article.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
          <Link href={href} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            {t("readMore")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </article>
  );
}
