// BlogCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    thumb_url?: string;
    category: string;
    published_at: string;
    reading_time_min: number;
    authors?: {
      name: string;
    };
  };
  locale: string;
  translations?: {
    categories: Record<string, string>;
    readMore: string;
    minRead: string;
    by?: string;
  };
}

export default function BlogCard({ post, locale, translations }: BlogCardProps) {
  const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mappa colori categorie
  const categoryColors: Record<string, string> = {
    'financial-education': 'bg-blue-100 text-blue-800 border-blue-200',
    'cybersecurity': 'bg-red-100 text-red-800 border-red-200',
    'digital-ethics': 'bg-purple-100 text-purple-800 border-purple-200',
    'eu-updates': 'bg-green-100 text-green-800 border-green-200',
    'company-news': 'bg-orange-100 text-orange-800 border-orange-200',
    'technology': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'tutorials': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  // Fallback sicuro
  const safeTranslations = translations || {
    categories: {},
    readMore: 'Leggi più →',
    minRead: 'min lettura',
    by: 'Di'
  };

  const categoryStyle = categoryColors[post.category] || 'bg-gray-100 text-gray-800 border-gray-200';
  const categoryLabel = safeTranslations.categories[post.category] || post.category;

  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col group">
        {/* Immagine */}
        {post.thumb_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.thumb_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>
        )}
        
        {/* Contenuto */}
        <div className="p-6 flex-1 flex flex-col">
          {/* CATEGORIA */}
          <div className="mb-3">
            <span className={`inline-block ${categoryStyle} text-xs font-medium px-3 py-1 rounded-full border`}>
              {categoryLabel}
            </span>
          </div>

          {/* DATA E AUTORE - OPZIONE B: Stessa linea */}
          <div className="text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <time className="font-medium">{formattedDate}</time>
              
              {post.authors?.name && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">{safeTranslations.by}</span>
                    <span className="font-medium text-gray-700">
                      {post.authors.name}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Titolo */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Estratto */}
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Footer: Tempo di lettura e CTA */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {post.reading_time_min} {safeTranslations.minRead}
            </span>
            <span className="text-blue-600 font-medium text-sm group-hover:text-blue-800 transition-colors">
              {safeTranslations.readMore}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}