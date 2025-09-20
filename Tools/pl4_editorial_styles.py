# tools/pl4_editorial_styles.py
# -*- coding: utf-8 -*-
"""
PL-4 – Stile editoriale per News/Blog:
- Crea un badge categoria riutilizzabile (components/ui/CategoryTag.tsx)
- Aggiorna le pagine di dettaglio News e Blog con hero image responsive, label, standfirst.
- Aggiunge stili tipografici in globals.css (lead paragraph, figure, caption).
Prerequisiti: Tailwind + @tailwindcss/typography già attivi (già fatto in PL-3).
"""

from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"

CATEGORY_TAG = WEBAPP / "components" / "ui" / "CategoryTag.tsx"
NEWS_PAGE = WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"
BLOG_PAGE = WEBAPP / "app" / "[locale]" / "blog" / "[slug]" / "page.tsx"
GLOBALS = WEBAPP / "app" / "globals.css"

CATEGORY_TAG_CODE = """export default function CategoryTag({
  children,
  color = "bg-orange-500",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className={`inline-block uppercase tracking-wide text-[11px] md:text-xs font-semibold text-white ${color} px-2.5 py-1 rounded-md`}
    >
      {children}
    </span>
  );
}
"""

NEWS_PAGE_CODE = """import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { notFound } from "next/navigation";
import Image from "next/image";
import CategoryTag from "@/components/ui/CategoryTag";

export const dynamic = "force-dynamic";

export default async function NewsDetail({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const supa = getSupabasePublicServer();
  const { data, error } = await supa
    .from("news")
    .select("id,title,body,source_url,cover_url,slug,published_at")
    .eq("slug", params.slug)
    .single();

  if (error || !data) return notFound();

  const dateStr = data.published_at
    ? new Date(data.published_at).toLocaleDateString(params.locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12 space-y-6">
      <header className="space-y-3">
        <CategoryTag>News</CategoryTag>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{data.title}</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
      </header>

      {data.cover_url && (
        <figure className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={data.cover_url}
              alt={data.title ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={false}
            />
          </div>
        </figure>
      )}

      {/* Standfirst / occhiello se il body ha una prima riga breve */}
      {data.body && (
        <p className="lead">
          {data.body.split("\\n\\n")[0]}
        </p>
      )}

      <article className="prose prose-neutral md:prose-lg max-w-none">
        {data.body &&
          data.body
            .split("\\n\\n")
            .slice(1)
            .map((p: string, i: number) => <p key={i}>{p}</p>)}
      </article>

      {data.source_url && (
        <p className="text-sm text-gray-600">
          Fonte:{" "}
          <a href={data.source_url} className="underline text-blue-600" target="_blank" rel="noreferrer">
            {data.source_url}
          </a>
        </p>
      )}
    </main>
  );
}
"""

BLOG_PAGE_CODE = """import { notFound } from "next/navigation";
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

      {post.excerpt && <p className="lead">{post.excerpt}</p>}

      <div className="prose prose-neutral md:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
"""

EXTRA_CSS = """
/* —— Editorial helpers —— */
.lead {
  @apply text-lg md:text-xl text-gray-700 leading-relaxed;
}
.prose img {
  @apply rounded-lg;
}
.prose figure {
  @apply my-6;
}
.prose figcaption {
  @apply text-sm text-gray-500;
}
"""

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")


def ensure_append(path: Path, snippet: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    base = path.read_text(encoding="utf-8") if path.exists() else ""
    if snippet.strip() not in base:
        path.write_text(base.rstrip() + "\\n" + snippet, encoding="utf-8", newline="
")

def main():
    # 1) CategoryTag
    write(CATEGORY_TAG, CATEGORY_TAG_CODE)
    print(f"[UP] {CATEGORY_TAG.relative_to(REPO)}")

    # 2) News detail page
    write(NEWS_PAGE, NEWS_PAGE_CODE)
    print(f"[UP] {NEWS_PAGE.relative_to(REPO)}")

    # 3) Blog detail page
    write(BLOG_PAGE, BLOG_PAGE_CODE)
    print(f"[UP] {BLOG_PAGE.relative_to(REPO)}")

    # 4) Extra CSS
    ensure_append(GLOBALS, EXTRA_CSS)
    print(f"[UP] {GLOBALS.relative_to(REPO)} (editorial css appended)")

    print("[DONE] Stile editoriale applicato a News e Blog.")

if __name__ == "__main__":
    main()
