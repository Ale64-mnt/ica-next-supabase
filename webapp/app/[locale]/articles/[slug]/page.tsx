// webapp/app/[locale]/articles/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import AlertMarkdown from '@/app/components/AlertMarkdown';



interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = params;
  const t = await getTranslations('Articles');
  
  const supabase = createClient();
  const { data: article, error } = await supabase
    
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .or(`locale.eq.${locale},locale.eq.multilingual`)
    .order('locale', { ascending: false })
    .limit(1)
    .single();

  if (error || !article) {
    notFound();
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString(locale, {
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
            Home
          </Link>
          <span style={{ margin: '0 0.5rem' }} aria-hidden="true">›</span>
          <Link href={`/${locale}/articles`} style={{ color: '#0056b3', textDecoration: 'none' }}>
            Articoli
          </Link>
          <span style={{ margin: '0 0.5rem' }} aria-hidden="true">›</span>
          <span style={{ color: '#666' }}>{article.title}</span>
        </nav>
      </div>

      {/* IMMAGINE PRINCIPALE - USA cover_url O image_url */}
      {(article.cover_url || article.image_url) && (
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
                  src={article.cover_url || article.image_url} // ✅ PRIORITÀ cover_url
                  alt={article.title}
                  fill
                  style={{ 
                    objectFit: 'contain'
                  }}
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                  unoptimized={true}
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
              dateTime={article.published_at}
            >
              Pubblicato il {formattedDate}
            </time>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1a1a1a', 
              marginBottom: '1rem',
              lineHeight: '1.3'
            }}>
              {article.title}
            </h1>
            {article.excerpt && (
              <p style={{ 
                fontSize: '1.2rem', 
                color: '#4a5568', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                {article.excerpt}
              </p>
            )}
          </header>

          {/* Contenuto testo */}
          <div 
            style={{ 
              lineHeight: '1.7',
              color: '#2d3748',
              fontSize: '1.125rem'
            }}
          >
            {article.body_md ? (
              <AlertMarkdown content={article.body_md} />
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
              href={`/${locale}/articles`}
              style={{ 
                color: '#0056b3', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              ← Torna agli articoli
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}