export function BlogList({ posts, locale }: { posts: any[]; locale: string }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((post) => (
        <div key={post.slug} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
