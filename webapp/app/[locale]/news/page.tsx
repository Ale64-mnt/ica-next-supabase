import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getLatestNews } from '@/app/lib/supabase/news-queries';

export default async function HomePage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Index');
  const newsT = await getTranslations('News');
  
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

      {/* Sezione News - RESPONSIVE CON ASPECT RATIO CORRETTO */}
      <section style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          {newsT('eu_updates')}
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {latestNews && latestNews.length > 0 ? (
            latestNews.map((news) => {
              const date = news.published_at 
                ? new Date(news.published_at).toLocaleDateString(params.locale) 
                : '';
              
              return (
                <Link 
                  key={news.id} 
                  href={`/${params.locale}/news/${news.slug}`}
                  style={{ 
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Container immagine - RESPONSIVE CON ASPECT RATIO 41:25 */}
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '0',
                      paddingBottom: '61%', // 250/410 = 0.6097 ≈ 61%
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {(news.thumb_url || news.image_url) ? (
                        <Image
                          src={news.thumb_url || news.image_url}
                          alt={news.image_alt || news.title}
                          fill
                          style={{ 
                            objectFit: 'cover',
                            position: 'absolute',
                            top: '0',
                            left: '0'
                          }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9ca3af',
                          fontSize: '0.8rem'
                        }}>
                          📷
                        </div>
                      )}
                    </div>
                    
                    {/* Contenuto della card */}
                    <div style={{ 
                      padding: '1.5rem',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Data */}
                      {date && (
                        <time 
                          style={{ 
                            fontSize: '0.8rem', 
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}
                        >
                          {date}
                        </time>
                      )}
                      
                      {/* Titolo */}
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold', 
                        marginBottom: '0.75rem',
                        lineHeight: '1.4',
                        color: '#1a1a1a',
                        flexGrow: 1
                      }}>
                        {news.title}
                      </h4>
                      
                      {/* Estratto */}
                      {news.excerpt && (
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: '#666',
                          lineHeight: '1.5',
                          marginBottom: '1rem'
                        }}>
                          {news.excerpt}
                        </p>
                      )}
                      
                      {/* Badge lingua */}
                      {news.locale && (
                        <span style={{ 
                          display: 'inline-block',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          fontSize: '0.7rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          alignSelf: 'flex-start'
                        }}>
                          {news.locale.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            // Fallback STATICO con stesso aspect ratio
            [1, 2, 3].map((item) => (
              <div 
                key={item} 
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '0',
                  paddingBottom: '61%',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontSize: '0.8rem'
                  }}>
                    📷
                  </div>
                </div>
                
                <div style={{ 
                  padding: '1.5rem',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <time style={{ 
                    fontSize: '0.8rem', 
                    color: '#666',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    {item}8 apr. 2025
                  </time>
                  
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 'bold', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.4',
                    color: '#1a1a1a',
                    flexGrow: 1
                  }}>
                    {newsT('news_title')}
                  </h4>
                  
                  <p style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '1rem'
                  }}>
                    {newsT('news_excerpt')}
                  </p>
                  
                  <span style={{ 
                    display: 'inline-block',
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    fontSize: '0.7rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    alignSelf: 'flex-start'
                  }}>
                    {params.locale.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <Link 
            href="/news" 
            style={{ 
              color: '#0056b3', 
              fontSize: '1rem', 
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.75rem 1.5rem',
              border: '2px solid #0056b3',
              borderRadius: '6px',
              display: 'inline-block'
            }}
          >
            {newsT('view_all_news')}
          </Link>
        </div>
      </section>

    </div>
  );
}