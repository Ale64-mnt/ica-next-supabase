// app/[locale]/blog/layout.tsx
import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import BlogSidebar from '@/app/components/blog/BlogSidebar';

interface BlogLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4"></h1>
          <p className="text-xl text-blue-100 max-w-3xl"></p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/3 xl:w-1/4">
            <BlogSidebar categories={categories || []} currentLocale={localeCode} />
          </aside>

          <div className="lg:w-2/3 xl:w-3/4">{children}</div>
        </div>
      </main>
    </div>
  );
}
