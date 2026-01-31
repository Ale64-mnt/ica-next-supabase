// app/[locale]/blog/layout.tsx
import type { ReactNode } from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import BlogSidebar from '@/app/components/blog/BlogSidebar';

interface BlogLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

function cleanLocale(locale: string): string {
  return locale.includes('-') ? locale.split('-')[0] : locale;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function BlogLayout({ children, params }: BlogLayoutProps) {
  const { locale } = await params;
  const supabase = createClient();

  const t = await getTranslations({ locale, namespace: 'Blog' });
  const localeCode = cleanLocale(locale);

  const { data: categories } = await supabase
    .from('category')
    .select(`
      category_id,
      category_key,
      name,
      parent_category_id,
      content_category (
        content:content_id (
          content_id,
          content_localization!inner (
            locale
          )
        )
      )
    `)
    .eq('scope', 'project');

  const cubeImage =
    'https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/icon/Blog.webp';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO CON LE STESSE DIMENSIONI DELLA PAGINA NEWS */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-white overflow-hidden">
        {/* Contenitore principale centrato sopra la griglia */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          {/* Layout a due colonne */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3rem',
            width: '100%',
            maxWidth: '900px'
          }}>
            {/* Colonna sinistra - Immagine cubo (300x300px come nell'altro hero) */}
            <div style={{
              flexShrink: 0,
              width: '300px',
              height: '300px',
              position: 'relative'
            }}>
              <Image
                src={cubeImage}
                alt={t('title')}
                fill
                style={{ 
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
                sizes="300px"
                priority
              />
            </div>

            {/* Colonna destra - Solo placeholder del sottotitolo */}
<div style={{
  textAlign: 'left',
  maxWidth: '500px'
}}>
  {/* Solo placeholder del sottotitolo in grassetto */}
  <p style={{ 
    fontSize: '1.8rem', 
    color: '#000000',
    margin: '0',
    lineHeight: '1.5',
    fontWeight: '700'
  }}>
    {t('subtitle')}
  </p>
</div>
          </div>
        </div>
      </div>

      {/* LAYOUT: cards a sinistra (larga), sidebar a destra (in alto) */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* SINISTRA: contenuto (larga) */}
          <section className="lg:col-span-9">{children}</section>

          {/* DESTRA: sidebar sticky */}
          <aside className="lg:col-span-3">
            <div className="lg:sticky lg:top-8">
              <BlogSidebar categories={categories || []} currentLocale={localeCode} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}