// app/[locale]/blog/components/BlogCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumb_url?: string;
  category: string;
  published_at: string;
  reading_time_min: number;
}

interface BlogCardProps {
  post: BlogPost;
  locale: string;
}

export default function BlogCard({ post, locale }: BlogCardProps) {
  const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link href={`/${locale}/blog/${post.slug}`}>
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        {/* Immagine */}
        {post.thumb_url && (
          <div className="relative h-48 w-full">
            <Image
              src={post.thumb_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        {/* Contenuto */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Categoria e Data */}
          <div className="flex justify-between items-center mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">
              {formattedDate}
            </span>
          </div>

          {/* Titolo */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
            {post.title}
          </h2>

          {/* Estratto */}
          <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Tempo di lettura */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {post.reading_time_min} min read
            </span>
            <span className="text-blue-600 font-medium text-sm">
              Leggi più →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}