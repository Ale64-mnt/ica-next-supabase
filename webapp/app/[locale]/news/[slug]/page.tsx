// app/[locale]/news/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import AlertMarkdown from '@/app/components/AlertMarkdown'; // <-- AGGIUNGI QUESTA RIGA

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
    .from('alert')
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

      {/* IMMAGINE PRINCIPALE - SENZA DIDASCALIA */}
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
            {news.excerpt && (
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#4a5568', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {news.excerpt}
              </p>
            )}
          </header>

          {/* Contenuto testo - MODIFICA SOLO QUESTA PARTE */}
          <div 
            style={{ 
              lineHeight: '1.7',
              color: '#2d3748',
              fontSize: '1.125rem'
            }}
          >
            {news.body_md ? (
              <AlertMarkdown content={news.body_md} /> // <-- SOSTITUISCI QUI
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Contenuto non disponibile.
              </p>
            )}
          </div>

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