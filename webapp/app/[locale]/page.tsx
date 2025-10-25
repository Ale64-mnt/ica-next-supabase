import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getLatestNews } from '@/app/lib/supabase/news-queries';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Index');
  const newsT = await getTranslations('News');
  
  // Recupera le news ma formatta le date SOLO in modo semplice
  const latestNews = await getLatestNews(params.locale, 3);

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Hero Section - invariata */}
      <section style={{ padding: '3rem 1rem', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
            {t('hero_title')}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: '1.6', marginBottom: '2rem' }}>
            {t('hero_subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/articles" style={{ backgroundColor: '#0056b3', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}>
              {t('discover_articles')}
            </Link>
            <Link href="/courses" style={{ backgroundColor: '#0056b3', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem' }}>
              {t('join_courses')}
            </Link>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '0' }} />

      {/* Sezione News - IBRIDA: dati reali ma formattazione semplice */}
      <section style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          {newsT('eu_updates')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {latestNews && latestNews.length > 0 ? (
            latestNews.map((news) => {
              // Formattazione data SEMPLICE e CONSISTENTE server/client
              const date = news.published_at 
                ? new Date(news.published_at).toLocaleDateString('it-IT') 
                : '';
              
              return (
                <div key={news.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                  <div style={{ minWidth: '80px', fontSize: '0.8rem', color: '#666' }}>
                    {date}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {news.title}
                  </div>
                </div>
              );
            })
          ) : (
            // Fallback STATICO (come nella versione vecchia)
            [1, 2, 3].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                <div style={{ minWidth: '80px', fontSize: '0.8rem', color: '#666' }}>
                  {item}8 apr. 2025
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {newsT('news_title')}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Link href="/news" style={{ color: '#0056b3', fontSize: '0.9rem', textDecoration: 'none' }}>
            {newsT('view_all_news')}
          </Link>
        </div>
      </section>

    </div>
  );
}