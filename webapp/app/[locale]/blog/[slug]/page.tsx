import { notFound } from "next/navigation";
import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import type { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { locale: string; slug: string };
};

async function fetchPost(slug: string) {
  const supa = getSupabasePublicServer();
  const { data, error } = await supa
    .from("articles")
    .select("id,title,excerpt,cover_url,slug,published_at")
    .eq("slug", slug)
    .limit(1)
    .single();
  if (error || !data) return null;
  return data;
}

// SEO dinamico
export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return {};
  const title = post.title;
  const description = post.excerpt ?? "";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/${params.locale}/blog/${post.slug}`;
  const images = post.cover_url ? [{ url: post.cover_url }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500">
          {post.published_at
            ? new Date(post.published_at).toLocaleString()
            : "—"}
        </p>
      </header>

      {post.cover_url && (
        <img
          src={post.cover_url}
          alt={post.title}
          className="w-full max-h-[480px] object-cover rounded-lg"
        />
      )}

      {/* Placeholder contenuto: per ora mostriamo excerpt.
          Quando aggiungerai il campo 'content' (MDX/HTML), lo renderemo qui. */}
      {post.excerpt && <p className="text-lg leading-7">{post.excerpt}</p>}
    </article>
  );
}
