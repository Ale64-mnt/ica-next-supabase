// app/[locale]/blog/components/BlogGrid.tsx
import BlogCard from './BlogCard';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  thumb_url?: string;
  category: string;
  published_at: string;
  reading_time_min: number;
  authors?: { // ⚠️ AGGIUNGI QUESTA PROPRIETÀ
    name: string;
  };
}

interface BlogGridProps {
  posts: BlogPost[];
  locale: string;
  noPostsText: string;
  translations: {
    categories: Record<string, string>;
    readMore: string;
    minRead: string;
    by: string; // ⚠️ AGGIUNGI QUESTA RIGA
  };
}

export default function BlogGrid({ posts, locale, noPostsText, translations }: BlogGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{noPostsText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard 
          key={post.id} 
          post={post} 
          locale={locale}
          translations={translations} // ⚠️ Ora include 'by'
        />
      ))}
    </div>
  );
}