// webapp/app/components/blog/BlogList.tsx
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User } from 'lucide-react';

interface Author {
  id: string;
  name: string;
  slug: string;
  avatar_url?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  reading_time_min?: number;
  published_at: string;
  thumb_url?: string;
  cover_url?: string;
  image_alt?: string;
  authors?: Author;
}

interface BlogListProps {
  posts: BlogPost[];
  locale: string;
}

export default function BlogList({ posts, locale }: BlogListProps) {
  const t = useTranslations('Blog');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Funzione per tradurre categorie
  const translateCategory = (categoryKey: string) => {
    return t(`categories.${categoryKey}`) || categoryKey;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article 
          key={post.id}
          className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* Immagine */}
          <Link href={`/${locale}/blog/${post.slug}`}>
            <div className="relative h-48 w-full overflow-hidden">
              {post.thumb_url || post.cover_url ? (
                <Image
                  src={post.thumb_url || post.cover_url!}
                  alt={post.image_alt || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">📄</span>
                </div>
              )}
              {/* Badge categoria TRADOTTA */}
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full">
                  {translateCategory(post.category)}
                </span>
              </div>
            </div>
          </Link>

          {/* Contenuto */}
          <div className="p-6">
            {/* Metadati */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
              </div>
              
              {post.reading_time_min && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    {post.reading_time_min} {t('minRead')}
                  </span>
                </div>
              )}
            </div>

            {/* Titolo */}
            <h2 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
              <Link href={`/${locale}/blog/${post.slug}`} className="line-clamp-2">
                {post.title}
              </Link>
            </h2>

            {/* Estratto */}
            {post.excerpt && (
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Autore */}
            {post.authors && (
              <div className="flex items-center gap-3 pt-4 border-t">
                {post.authors.avatar_url && (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={post.authors.avatar_url}
                      alt={post.authors.name}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">{t('by')}</span>
                  <Link 
                    href={`/${locale}/blog/author/${post.authors.slug}`}
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    {post.authors.name}
                  </Link>
                </div>
              </div>
            )}

            {/* Link Leggi di più - USA TRADUZIONE */}
            <div className="mt-6">
              <Link
                href={`/${locale}/blog/${post.slug}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                {t('readMore')} {/* ✅ Usa la traduzione esistente */}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}