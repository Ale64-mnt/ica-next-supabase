import Link from 'next/link';
import Image from 'next/image';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  image_url: string;
  image_alt: string;
  slug: string;
  published_at: string;
}

interface NewsCardProps {
  news: NewsItem;
  locale: string;
}

export default function NewsCard({ news, locale }: NewsCardProps) {
  const formattedDate = new Date(news.published_at).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <article className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link href={`/${locale}/news/${news.slug}`} className="block">
        {/* Immagine */}
        {news.image_url && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={news.image_url}
              alt={news.image_alt || news.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        {/* Contenuto */}
        <div className="p-6">
          {/* Data */}
          <time className="text-sm text-gray-500 block mb-3">
            {formattedDate}
          </time>
          
          {/* Titolo */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {news.title}
          </h3>
          
          {/* Estratto */}
          <p className="text-gray-600 line-clamp-3 mb-4">
            {news.excerpt}
          </p>
          
          {/* Link Leggi più */}
          <div className="flex items-center text-blue-600 font-semibold">
            Leggi di più
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}