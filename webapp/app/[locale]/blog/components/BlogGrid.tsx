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
}

interface BlogGridProps {
  posts: BlogPost[];
  locale: string;
  noPostsText: string; // <-- NUOVA PROP PER LA TRADUZIONE
}

export default function BlogGrid({ posts, locale, noPostsText }: BlogGridProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{noPostsText}</p> {/* <-- USA LA TRADUZIONE */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
}