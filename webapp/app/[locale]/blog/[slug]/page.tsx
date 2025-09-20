import { notFound } from "next/navigation";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";
import Image from "next/image";
import CategoryTag from "@/components/ui/CategoryTag";
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

  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString(params.locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12 space-y-6">
      <header className="space-y-3">
        <CategoryTag>Blog</CategoryTag>
        {post?.categories?.length ? (
  <div className="mb-3 flex gap-2">{/* __PL7_CATEGORIES__ */}
    {post.categories.map((c:any)=> (
      <CategoryBadge key={c.id} locale={params.locale} slug={c.slug} label={c.name || c.slug} />
    ))}
  </div>
) : null}
<h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{post.title}</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
      </header>

      {post.cover_url && (
        <figure className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={post.cover_url}
              alt={post.title ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={false}
            />
          </div>
        </figure>
      )}

      {post.excerpt && <p className="text-lg md:text-xl text-gray-700 leading-relaxed">{post.excerpt}</p>}

      <div className="prose prose-neutral md:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
