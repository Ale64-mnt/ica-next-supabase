// app/[locale]/blog/page.tsx
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/app/lib/supabase/server';
import BlogGrid from '@/app/[locale]/blog/components/BlogGrid';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; // ⚠️ Next.js 14+ usa Promise params
  const t = await getTranslations('Blog');
  const supabase = await createClient(); // ⚠️ Aggiungi await se è async

  // Fetch published blog posts WITH AUTHORS
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      authors (
        id,
        name,
        slug,
        avatar_url
      )
    `)
    .eq('locale', locale)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
  }

  // Debug: controlla cosa restituisce
  console.log(`Found ${posts?.length || 0} posts`);
  if (posts && posts.length > 0) {
    console.log('First post authors:', posts[0].authors);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Blog Grid con traduzione passata come prop */}
        <BlogGrid 
          posts={posts || []} 
          locale={locale}
          noPostsText={t('no_posts')}
          translations={{
            categories: t.raw('categories'),
            readMore: t('readMore'),
            minRead: t('minRead'),
            by: t('by') // ⚠️ AGGIUNGI questa traduzione!
          }}
        />
      </div>
    </div>
  );
}