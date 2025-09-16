import { notFound } from "next/navigation";
import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Metadata, ResolvingMetadata } from "next";

type Props = { params: { locale: string; slug: string } };

async function fetchPost(slug: string) {
  const supa = getSupabasePublicServer();
  const { data } = await supa
    .from("articles")
    .select("id,title,excerpt,content,cover_url,slug,published_at")
    .eq("slug", slug)
    .single();
  return data || null;
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return {};
  const title = post.title;
  const description = post.excerpt ?? "";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = `${base}/${params.locale}/blog/${post.slug}`;
  const images = post.cover_url ? [{ url: post.cover_url }] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, url, type: "article", images },
    alternates: { canonical: url },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await fetchPost(params.slug);
  if (!post) return notFound();

  const html = post.content
    ? sanitizeHtml(await marked.parse(post.content))
    : (post.excerpt ? `<p>${sanitizeHtml(post.excerpt)}</p>` : "");

  return (
    <article className="max-w-3xl mx-auto py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500">
          {post.published_at ? new Date(post.published_at).toLocaleString(params.locale) : "—"}
        </p>
      </header>

      {post.cover_url && (
        <img src={post.cover_url} alt={post.title} className="w-full max-h-[480px] object-cover rounded-lg" />
      )}

      <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
