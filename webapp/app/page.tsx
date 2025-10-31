import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const t = await getTranslations('Index');
  const supabase = createClient();

  // ✅ USA LA TABELLA ARTICLES ESISTENTE
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('locale', locale)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching articles:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle_articles')}
        </p>
      </section>

      {/* Sezione Articoli - CORRETTA */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Ultimi Articoli</h2>
          <Link 
            href={`/${locale}/articles`}  // ✅ LINK CORRETTO
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Vedi tutti →
          </Link>
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow">
                {(article.cover_url || article.image_url) && (
                  <Image 
                    src={article.cover_url || article.image_url!}
                    alt={article.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    unoptimized={true}
                  />
                )}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {new Date(article.published_at).toLocaleDateString(locale)}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {article.excerpt || article.body_md?.substring(0, 150)}...
                  </p>
                  <Link 
                    href={`/${locale}/articles/${article.slug}`}  // ✅ SLUG CORRETTO
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

      {/* Sezioni Additionali */}
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