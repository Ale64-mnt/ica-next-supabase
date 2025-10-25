
// app/[locale]/news/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/server';

interface Props {
  params: {
    locale: string;
  };
}

export default async function NewsListPage({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('News');
  
  const supabase = createClient();
  const { data: news, error } = await supabase
    .from('alert')
    .select('*')
    .eq('locale', locale)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', marginBottom: '1rem' }}>
            {t('all_news')}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {t('news_description')}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {news && news.length > 0 ? (
            news.map((item) => (
              <article key={item.id} style={{ 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                padding: '1.5rem',
                transition: 'box-shadow 0.2s'
              }}>
                <Link 
                  href={`/${locale}/news/${item.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <time style={{ color: '#666', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                    {t('published_on')} {new Date(item.published_at).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </time>
                  <h2 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    marginBottom: '0.5rem'
                  }}>
                    {item.title}
                  </h2>
                  {item.excerpt && (
                    <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
                      {item.excerpt}
                    </p>
                  )}
                  <span style={{ color: '#0056b3', fontWeight: '500' }}>
                    {t('read_more')} →
                  </span>
                </Link>
              </article>
            ))
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
              {t('no_news')}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
