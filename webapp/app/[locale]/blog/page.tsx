import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function BlogPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Blog');

  const blogPosts = [
    {
      slug: 'guida-investimenti-base',
      title: t('posts.guida_investimenti_title'),
      excerpt: t('posts.guida_investimenti_excerpt'),
      date: '2024-01-15',
      author: 'Marco Rossi'
    },
    {
      slug: 'finanza-personale-2024', 
      title: t('posts.finanza_personale_title'),
      excerpt: t('posts.finanza_personale_excerpt'),
      date: '2024-01-10',
      author: 'Laura Bianchi'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/${params.locale}/blog/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{post.author}</span>
              <span>{post.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
