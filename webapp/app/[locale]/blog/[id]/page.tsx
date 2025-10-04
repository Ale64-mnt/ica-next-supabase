import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

// Interfacce per la tipizzazione dei dati
interface BlogPostContent {
  id: string;
  title: string;
  body_md: string; 
  created_at: string;
  image_url?: string; 
  image_alt?: string; 
}

interface BlogPostPageProps {
  params: {
    id: string;
    locale: string; 
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const t = await getTranslations('Blog'); 
  const supabase = createClient();
  const postId = params.id;
  
  // Recupero dei dati del post con tipizzazione sicura
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('id, title, body_md, created_at, image_url, image_alt')
    .eq('id', postId) 
    .eq('locale', params.locale)
    .single<BlogPostContent>();
  
  // Gestione dell'errore o del post non trovato
  if (error || !post) {
    if (error) console.error('Supabase error:', error.message);
    notFound(); 
  }
  
  return (
    <main>
      {/* Link di accessibilità "Salta al contenuto" */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-3 focus:bg-gray-800 focus:text-white focus:rounded-br-lg"
      >
        {t('skip_to_main_content')}
      </a>

      {/* Container immagine con dimensioni controllate */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="w-full aspect-video max-h-48 rounded-lg shadow-lg overflow-hidden bg-gray-200">
          <Image
            src={post.image_url || '/placeholder.png'} 
            alt={post.image_alt || `${t('hero_image_for')} ${post.title}`} 
            width={800}
            height={200}
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            priority
          />
        </div>
      </div>

      {/* Contenuto principale */}
      <div id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-8">
          {t('published_on')}: {new Date(post.created_at).toLocaleDateString(params.locale, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>

        <article className="prose lg:prose-xl prose-indigo max-w-none">
          <ReactMarkdown>{post.body_md}</ReactMarkdown>
        </article>

        <div className="mt-12 pt-6 border-t">
          <Link 
            href={`/${params.locale}/blog`} 
            className="text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center"
          >
            &larr; {t('back_to_blog')}
          </Link>
        </div>
      </div>
    </main>
  );
}