import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ 
  params 
}: { 
  params: { locale: string; slug: string } 
}) {
  const t = await getTranslations('Blog');
  
  // Simula fetch dati - sostituire con dati reali
  const post = {
    slug: params.slug,
    title: t('posts.guida_investimenti_title'),
    content: t('posts.guida_investimenti_content', { defaultValue: 'Contenuto del post...' }),
    date: '2024-01-15',
    author: 'Marco Rossi'
  };

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex gap-4 text-gray-600 mb-6">
          <span>Di {post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
        <div className="prose max-w-none">
          <p>{post.content}</p>
        </div>
      </article>
    </div>
  );
}
