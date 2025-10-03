// Sostituisci TUTTO il contenuto di webapp/app/[locale]/blog/page.tsx con questo codice

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import Link from 'next/link'; 
import Image from 'next/image';

interface BlogPostCard {
  id: number;
  title: string;
  created_at: string;
  image_url: string | null;
  image_alt: string | null;
}

interface BlogPageProps {
  params: {
    locale: string;
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const t = await getTranslations('Blog');
  const supabase = createClient();

  // Query corretta SENZA 'summary'
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, created_at, image_url, image_alt') 
    .eq('locale', params.locale)
    .order('created_at', { ascending: false }) as { data: BlogPostCard[] | null, error: any };

  if (error) {
    console.error("Errore nel caricamento dei post:", error);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-extrabold text-center mb-16 text-gray-900">
        {t('title')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Link 
              href={`/${params.locale}/blog/${post.id}`} 
              key={post.id} 
              className="group block"
            >
              <article className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
                
                <div className="relative w-full aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.image_url || '/placeholder.png'}
                    alt={post.image_alt || `Immagine per ${post.title}`}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString(params.locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-900 flex-grow">
                    {post.title}
                  </h2>
                  {/* Riga che mostrava il summary è stata rimossa */}
                  <p className="mt-4 text-indigo-600 group-hover:text-indigo-800 text-sm font-semibold">
                    {t('read_post')}
                  </p>
                </div>

              </article>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">{t('no_posts')}</p>
        )}
      </div>
    </main>
  );
}