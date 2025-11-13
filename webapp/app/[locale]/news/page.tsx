// webapp/app/[locale]/news/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabase/server';

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('News');
  
  const supabase = createClient();
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('locale', params.locale)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
  }

  // Mappa colori categorie (stessa di BlogCard e altre pagine)
  const categoryColors: Record<string, string> = {
    'financial-education-eu': 'bg-blue-100 text-blue-800 border-blue-200',
    'cybersecurity-frauds': 'bg-red-100 text-red-800 border-red-200',
    'digital-ethics': 'bg-purple-100 text-purple-800 border-purple-200',
    'eu-updates': 'bg-green-100 text-green-800 border-green-200',
    'company-news': 'bg-orange-100 text-orange-800 border-orange-200',
    'practical-guides': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'multilingual-education': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HERO CON IMMAGINE AGGIORNATO */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-gray-100 overflow-hidden">
        <Image
          src="/images/News/news-1200x800.webp"
          alt={t('news') || 'News e aggiornamenti'}
          fill
          style={{ 
            objectFit: 'contain',
            position: 'absolute',
            top: '0',
            left: '0'
          }}
          sizes="100vw"
          priority
        />
        <div style={{
          position: 'absolute',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              marginBottom: '1.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              {t('news')}
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              maxWidth: '800px',
              margin: '0 auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              lineHeight: '1.6'
            }}>
              {t('news_description')}
            </p>
          </div>
        </div>
      </div>

      {/* Lista News */}
      <section style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {news && news.length > 0 ? (
            news.map((newsItem) => {
              const date = newsItem.published_at 
                ? new Date(newsItem.published_at).toLocaleDateString(params.locale) 
                : '';
              
              // Ottieni stile categoria e traduzione
              const categoryStyle = categoryColors[newsItem.category] || 'bg-gray-100 text-gray-800 border-gray-200';
              const categoryLabel = t.raw('categories')[newsItem.category] || newsItem.category;

              return (
                <Link 
                  key={newsItem.id} 
                  href={`/${params.locale}/news/${newsItem.slug}`}
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
                    {/* Container immagine */}
                    <div style={{ 
                      position: 'relative', 
                      width: '100%', 
                      height: '0',
                      paddingBottom: '61%',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {(newsItem.thumb_url || newsItem.image_url) ? (
                        <Image
                          src={newsItem.thumb_url || newsItem.image_url}
                          alt={newsItem.image_alt || newsItem.title}
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
                      {/* CATEGORIA - SOPRA LA DATA */}
                      {newsItem.category && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span 
                            className={`inline-block ${categoryStyle} text-xs font-medium px-3 py-1 rounded-full border`}
                            style={{ 
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              borderWidth: '1px'
                            }}
                          >
                            {categoryLabel}
                          </span>
                        </div>
                      )}

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
                        {newsItem.title}
                      </h4>
                      
                      {/* Estratto */}
                      {newsItem.excerpt && (
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: '#666',
                          lineHeight: '1.5',
                          marginBottom: '1rem'
                        }}>
                          {newsItem.excerpt}
                        </p>
                      )}
                      
                      {/* Badge lingua */}
                      {newsItem.locale && (
                        <span style={{ 
                          display: 'inline-block',
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563',
                          fontSize: '0.7rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          alignSelf: 'flex-start'
                        }}>
                          {newsItem.locale.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              gridColumn: '1 / -1'
            }}>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                {t('no_news')}
              </p>
            </div>
          )}
        </div>
        
        {/* Link back to home */}
        <div style={{ textAlign: 'center' }}>
          <Link 
            href={`/${params.locale}`}
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
            ← {t('home')}
          </Link>
        </div>
      </section>

    </div>
  );
}