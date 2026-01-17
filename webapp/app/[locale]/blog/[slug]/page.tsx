// app/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import AlertMarkdown from '@/app/components/AlertMarkdown';
import Link from 'next/link';
import Image from 'next/image';

type PageParams = {
  locale: string;
  slug: string;
};

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, excerpt, image_url, image_alt')
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single();

  if (!post) return { title: 'Articolo non trovato' };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: post.image_url ? [{ url: post.image_url, alt: post.image_alt }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<PageParams> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      authors (
        id,
        slug,
        name,
        title,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('published', true)
    .single();

  if (error || !post) {
    console.error('Error fetching post:', error);
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        {/* Categoria e tempo lettura */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {post.category}
          </span>
          <span>•</span>
          <span>{post.reading_time_min || 5} min read</span>
          <span>•</span>
          <span>{new Date(post.published_at!).toLocaleDateString('it-IT')}</span>
        </div>

        {/* Titolo */}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        {/* Estratto */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
        )}

        {/* Autore */}
        {post.authors && (
          <div className="flex items-center gap-3 mb-8">
            {post.authors.avatar_url && (
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={post.authors.avatar_url}
                  alt={post.authors.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <Link 
                href={`/${locale}/blog/author/${post.authors.slug}`}
                className="font-semibold hover:text-blue-600 transition-colors"
              >
                {post.authors.name}
              </Link>
              {post.authors.title && (
                <p className="text-sm text-gray-500">{post.authors.title}</p>
              )}
            </div>
          </div>
        )}

        {/* Immagine cover */}
        {post.cover_url && (
          <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
            <Image
              src={post.cover_url}
              alt={post.image_alt || post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </header>

      {/* Contenuto */}
      <div className="prose prose-lg max-w-none">
        {post.body_md ? (
          <AlertMarkdown content={post.body_md} />
        ) : (
          <p className="text-gray-500 italic">Contenuto non disponibile</p>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Torna al blog */}
        <div className="mt-8">
          <Link 
            href={`/${locale}/blog`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Torna al blog
          </Link>
        </div>
      </footer>
    </article>
  );
}

export const dynamic = 'force-dynamic';