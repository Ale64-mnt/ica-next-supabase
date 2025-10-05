'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface HomeContentProps {
  locale: string;
  initialPosts: any[];
}

export default function HomeContent({ locale, initialPosts }: HomeContentProps) {
  const t = useTranslations('Blog');

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <Link 
          href={`/${locale}/blog`} 
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          Vedi tutti →
        </Link>
      </div>

      {initialPosts && initialPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow">
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt={post.image_alt || post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {new Date(post.created_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.body_md?.substring(0, 150)}...
                </p>
                <Link 
                  href={`/${locale}/blog/${post.id}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                >
                  {t('read_post')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('no_posts')}</p>
        </div>
      )}
    </section>
  );
}