import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface HomeContentProps {
  locale: string;
  initialPosts: any[];
}

export default async function HomeContent({ locale, initialPosts }: HomeContentProps) {
  const t = await getTranslations('Blog');

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <Link
          href={`/${locale}/blog`}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          {t('view_all')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString(locale)}
                </span>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  {t('read_more')}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
