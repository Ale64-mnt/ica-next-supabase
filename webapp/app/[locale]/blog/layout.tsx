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
      {/* HERO RESPONSIVE - Layout a due colonne su desktop, colonna su mobile */}
      <div className="relative w-full bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16">
            
            {/* Immagine - Sopra su mobile, sinistra su desktop */}
            <div className="w-48 h-48 md:w-60 md:h-60 lg:w-72 lg:h-72 relative flex-shrink-0">
              <Image
                src={cubeImage}
                alt={t('title')}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 240px, 288px"
                priority
              />
            </div>

            {/* Testo - Sotto su mobile, destra su desktop */}
            <div className="text-center md:text-left max-w-lg md:max-w-xl">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight md:leading-normal">
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