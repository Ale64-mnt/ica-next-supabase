import Link from 'next/link';

type Post = {
  id: string;
  lang: string;
  slug: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
};

export default function BlogPostCard({ post }: { post: Post }) {
  return (
    <div className="block border rounded-lg overflow-hidden shadow-lg bg-white flex flex-col">
      <Link href={`/${post.lang}/blog/${post.slug}`} className="block">
        <img
          src={post.image_url || 'https://placehold.co/600x400?text=Immagine'}
          alt={`Copertina per ${post.title}`}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2">
          <Link href={`/${post.lang}/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="text-gray-700 flex-grow">{post.excerpt}</p>}
      </div>
    </div>
  );
}