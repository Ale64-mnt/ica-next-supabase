// webapp/app/[locale]/news/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import AlertMarkdown from '@/app/components/AlertMarkdown';
import { InternationalCybercrimeLink } from '../../cybercrime-report/components/InternationalCybercrimeLink';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = params;
  const t = await getTranslations('News');
  
  const supabase = createClient();
  const { data: news, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('locale', locale)
    .single();

  if (error || !news) {
    notFound();
  }

  const formattedDate = new Date(news.published_at).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Mappa colori categorie
  const categoryColors: Record<string, string> = {
    'financial-education-eu': 'bg-blue-100 text-blue-800 border-blue-200',
    'cybersecurity-frauds': 'bg-red-100 text-red-800 border-red-200',
    'digital-ethics': 'bg-purple-100 text-purple-800 border-purple-200',
    'eu-updates': 'bg-green-100 text-green-800 border-green-200',
    'company-news': 'bg-orange-100 text-orange-800 border-orange-200',
    'practical-guides': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'multilingual-education': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  const categoryStyle = categoryColors[news.category] || 'bg-gray-100 text-gray-800 border-gray-200';
  const categoryLabel = t.raw('categories')[news.category] || news.category;

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Breadcrumb */}
      <div style={{ padding: '2rem 1rem 0 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <nav aria-label="Percorso di navigazione" style={{ marginBottom: '1rem' }}>
          <Link href={`/${locale}`} style={{ color: '#0056b3', textDecoration: 'none' }}>
            {t('home')}
          </Link>
          <span style={{ margin: '0 0.5rem' }} aria-hidden="true">›</span>
          <Link href={`/${locale}/news`} style={{ color: '#0056b3', textDecoration: 'none' }}>
            {t('news')}
          </Link>
          <span style={{ margin: '0 0.5rem' }} aria-hidden="true">›</span>
          <span style={{ color: '#666' }}>{news.title}</span>
        </nav>
      </div>

      {/* IMMAGINE PRINCIPALE */}
      {news.image_url && (
        <div style={{ 
          width: '100%', 
          backgroundColor: '#f8f9fa', 
          padding: '2rem 0',
          marginBottom: '0'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '400px'
              }}>
                <Image
                  src={news.image_url}
                  alt={news.image_alt || news.title}
                  fill
                  style={{ 
                    objectFit: 'contain'
                  }}
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENUTO PRINCIPALE */}
      <div style={{ padding: '0 1rem 2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <article>
          
          {/* Header articolo */}
          <header style={{ marginBottom: '2rem', paddingTop: '2rem' }}>
            {/* CATEGORIA - SOPRA LA DATA */}
            {news.category && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span 
                  className={`inline-block ${categoryStyle} text-xs font-medium px-3 py-1 rounded-full border`}
                  style={{ 
                    fontSize: '0.75rem',
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

            <time 
              style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}
              dateTime={news.published_at}
            >
              {t('published_on')} {formattedDate}
            </time>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1a1a1a', 
              marginBottom: '1rem',
              lineHeight: '1.3'
            }}>
              {news.title}
            </h1>
            {/*news.excerpt && (
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#4a5568', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {news.excerpt}
              </p>
            )*/}
          </header>

          {/* Contenuto testo */}
          <div 
            style={{ 
              lineHeight: '1.7',
              color: '#2d3748',
              fontSize: '1.125rem'
            }}
          >
            {news.body_md ? (
              <AlertMarkdown content={news.body_md} />
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Contenuto non disponibile.
              </p>
            )}
          </div>

          {/* === BOTTONE CYBERCRIME SOLO PER CATEGORIA CYBERSECURITY === */}
          {news.category === 'cybersecurity-frauds' && (
            <div style={{ margin: '3rem 0' }}>
              <InternationalCybercrimeLink />
            </div>
          )}

          {/* Footer con link di ritorno */}
          <footer style={{ 
            marginTop: '3rem', 
            paddingTop: '2rem', 
            borderTop: '1px solid #e2e8f0' 
          }}>
            <Link 
              href={`/${locale}/news`}
              style={{ 
                color: '#0056b3', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              ← {t('back_to_news')}
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}