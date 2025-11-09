import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export default async function BlogPostPage({ params }: { params: { locale: string; slug: string } }) {
  const t = await getTranslations('Blog');
  const tCategories = await getTranslations('BlogCategories');
  const supabase = createClient();

  // Fetch dati REALI da Supabase
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('locale', params.locale)
    .eq('published', true)
    .single();

  if (error || !post) {
    notFound();
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString(params.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mappa colori categorie (stessa di BlogCard)
  const categoryColors: Record<string, string> = {
    'financial-education-eu': 'bg-blue-100 text-blue-800 border-blue-200',
    'cybersecurity-frauds': 'bg-red-100 text-red-800 border-red-200',
    'digital-ethics': 'bg-purple-100 text-purple-800 border-purple-200',
    'eu-updates': 'bg-green-100 text-green-800 border-green-200',
    'company-news': 'bg-orange-100 text-orange-800 border-orange-200',
    'practical-guides': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'multilingual-education': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  const categoryStyle = categoryColors[post.category] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-6">
        <Link href={`/${params.locale}/blog`} className="text-blue-600 hover:underline">
          ← {t('back_to_blog')}
        </Link>
      </nav>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con CATEGORIA TRADOTTA */}
        <header className="mb-8">
          {/* CATEGORIA - PRIMA DEL TITOLO */}
          <div className="mb-4">
            <span className={`inline-block ${categoryStyle} text-sm font-medium px-4 py-2 rounded-full border`}>
              {tCategories(post.category)}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-600">
            <time dateTime={post.published_at}>{formattedDate}</time>
            <span>•</span>
            <span>{post.reading_time_min} min read</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.image_alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed">
            {post.body_md ? (
              <div className="whitespace-pre-line">{post.body_md}</div>
            ) : (
              <p>Contenuto non disponibile.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}