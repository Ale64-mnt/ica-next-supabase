// app/components/blog/ArticleCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
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
  parent_category_key?: string;
}

interface ArticleCardProps {
  article: {
    id: string | number;
    slug: string;
    title: string;
    excerpt?: string;
    cover_url?: string;
    thumb_url?: string;
    image_url?: string;  // AGGIUNGI QUESTA LINEA
    image_alt?: string;
    published_at: string;
    reading_time_min?: number;
    locale: string;
    author?: Author;
    category?: Category;
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

  const imageUrl = article.cover_url || article.thumb_url;
  const imageAlt = article.image_alt || article.title;

  return (
    <article
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
      aria-labelledby={`article-title-${article.id}`}
    >
      {/* Immagine */}
      <Link
        href={`/${article.locale}/blog/${article.slug}`}
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
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">📄</span>
          </div>
        )}
      </Link>

      {/* Contenuto */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Categoria */}
        {article.category && (
          <div className="mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {article.category.name}
            </span>
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
        <h2
          id={`article-title-${article.id}`}
          className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors"
        >
          <Link href={`/${article.locale}/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h2>

        {/* Estratto */}
        {article.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
            {article.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {article.author && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-800">
                  {article.author.name}
                </div>
              </div>
            )}
            
            <Link
              href={`/${article.locale}/blog/${article.slug}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("readMore")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
