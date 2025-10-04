import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Index');
  const supabase = createClient();

  // Recupera i post del blog per la homepage
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('locale', locale)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching blog posts:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('subtitle_articles')}</p>
      </section>

      {/* Sezione Blog Posts */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Ultimi Articoli</h2>
          <Link 
            href={`/${locale}/blog`} 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Vedi tutti →
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
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
                    Leggi di più →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nessun articolo trovato</p>
          </div>
        )}
      </section>

      {/* Additional Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-3">News</h3>
          <p className="text-gray-600 mb-4">Scopri le ultime novità e aggiornamenti.</p>
          <Link 
            href={`/${locale}/news`}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Vedi le News →
          </Link>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-bold text-xl mb-3">Articoli</h3>
          <p className="text-gray-600 mb-4">Approfondimenti e analisi dettagliate.</p>
          <Link 
            href={`/${locale}/articles`}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Esplora Articoli →
          </Link>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Index');

  return {
    title: t('title'),
    description: t('subtitle_articles'),
  };
}