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

      {/* Sezione News - LAYOUT PULITO EDUTOPIA-STYLE */}
      <section style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          {newsT('eu_updates')}
        </h3>
        
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {latestNews && latestNews.length > 0 ? (
            latestNews.map((news) => {
              const date = news.published_at 
                ? new Date(news.published_at).toLocaleDateString(params.locale, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) 
                : '';
              
              return (
                <article key={news.id} style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Link 
                    href={`/${params.locale}/news/${news.slug}`}
                    style={{ 
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'flex-start',
                      padding: '0'
                    }}
                  >
                    {/* IMMAGINE - DIMENSIONI FISSE EDUTOPIA-STYLE */}
                    <div style={{ 
                      position: 'relative', 
                      width: '220px', 
                      height: '150px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      borderRadius: '8px 0 0 8px'
                    }}>
                      {(news.thumb_url || news.image_url) ? (
                        <Image
                          src={news.thumb_url || news.image_url}
                          alt={news.image_alt || news.title}
                          fill
                          style={{ 
                            objectFit: 'cover'
                          }}
                          sizes="220px"
                        />
                      ) : (
                        <div style={{
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
                    
                    {/* CONTENUTO TESTO */}
                    <div style={{ 
                      padding: '1.5rem 1.5rem 1.5rem 0',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0
                    }}>
                      {/* Data - come "eyebrow" di Edutopia */}
                      {date && (
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#666',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '0.75rem'
                        }}>
                          {date}
                        </div>
                      )}
                      
                      {/* Titolo */}
                      <h4 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: 'bold', 
                        marginBottom: '0.75rem',
                        lineHeight: '1.3',
                        color: '#1a1a1a'
                      }}>
                        {news.title}
                      </h4>
                      
                      {/* Estratto */}
                      {news.excerpt && (
                        <p style={{ 
                          fontSize: '0.95rem', 
                          color: '#666',
                          lineHeight: '1.5',
                          marginBottom: '1rem'
                        }}>
                          {news.excerpt}
                        </p>
                      )}
                      
                      {/* Badge lingua + eventuale autore */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: 'auto'
                      }}>
                        {news.locale && (
                          <span style={{ 
                            display: 'inline-block',
                            backgroundColor: '#f3f4f6',
                            color: '#4b5563',
                            fontSize: '0.7rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontWeight: '500'
                          }}>
                            {news.locale.toUpperCase()}
                          </span>
                        )}
                        
                        <span style={{ 
                          color: '#0056b3', 
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {newsT('read_more')} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })
          ) : (
            // Fallback STATICO con stesso layout
            [1, 2, 3].map((item) => (
              <article 
                key={item} 
                style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  padding: '0'
                }}>
                  <div style={{ 
                    width: '220px', 
                    height: '150px',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    flexShrink: 0,
                    borderRadius: '8px 0 0 8px'
                  }}>
                    📷
                  </div>
                  
                  <div style={{ 
                    padding: '1.5rem 1.5rem 1.5rem 0',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      color: '#666',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.75rem'
                    }}>
                      {item} Oct 2024
                    </div>
                    
                    <h4 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold', 
                      marginBottom: '0.75rem',
                      lineHeight: '1.3',
                      color: '#1a1a1a'
                    }}>
                      {newsT('news_title')}
                    </h4>
                    
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: '#666',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {newsT('news_excerpt')}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginTop: 'auto'
                    }}>
                      <span style={{ 
                        display: 'inline-block',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        fontSize: '0.7rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        {params.locale.toUpperCase()}
                      </span>
                      
                      <span style={{ 
                        color: '#0056b3', 
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        {newsT('read_more')} →
                      </span>
                    </div>
                  </div>
                </div>
              </article>
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