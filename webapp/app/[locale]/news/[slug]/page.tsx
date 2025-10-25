
// app/[locale]/news/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import Link from 'next/link';

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
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <nav style={{ marginBottom: '2rem' }}>
          <Link href={`/${locale}`} style={{ color: '#0056b3', textDecoration: 'none' }}>
            {t('home')}
          </Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <Link href={`/${locale}/news`} style={{ color: '#0056b3', textDecoration: 'none' }}>
            {t('news')}
          </Link>
          <span style={{ margin: '0 0.5rem' }}>›</span>
          <span style={{ color: '#666' }}>{news.title}</span>
        </nav>

        <article>
          <header style={{ marginBottom: '2rem' }}>
            <time style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
              {t('published_on')} {formattedDate}
            </time>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
              {news.title}
            </h1>
            {news.excerpt && (
              <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.6' }}>
                {news.excerpt}
              </p>
            )}
          </header>

          {news.image_url && (
            <div style={{ marginBottom: '2rem' }}>
              <img 
                src={news.image_url} 
                alt={news.image_alt || news.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </div>
          )}

          <div style={{ lineHeight: '1.8', color: '#333' }}>
            {news.body_md ? (
              <div dangerouslySetInnerHTML={{ __html: news.body_md }} />
            ) : (
              <p>Contenuto non disponibile.</p>
            )}
          </div>

          <footer style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
            <Link 
              href={`/${locale}/news`}
              style={{ 
                color: '#0056b3', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
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

// COMMENTA O RIMUOVI generateStaticParams - causa errori con cookies()
// export async function generateStaticParams() {
//   const supabase = createClient();
//   const { data: news } = await supabase
//     .from('alert')
//     .select('slug, locale')
//     .eq('published', true);
//
//   return news?.map((item) => ({
//     slug: item.slug,
//     locale: item.locale,
//   })) || [];
// }
