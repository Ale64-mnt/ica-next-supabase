# tools/pl3_articles_markdown.py
# -*- coding: utf-8 -*-
"""
PL-3 (Articoli Markdown):
1) Crea/aggiorna lib/sanitize.ts
2) Sovrascrive app/[locale]/blog/[slug]/page.tsx per rendering content Markdown
"""

from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"

SANITIZE_PATH = WEBAPP / "lib" / "sanitize.ts"
ARTICLE_PAGE_PATH = WEBAPP / "app" / "[locale]" / "blog" / "[slug]" / "page.tsx"

SANITIZE_TS = """import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

let purify: ReturnType<typeof createDOMPurify> | null = null;

export function sanitizeHtml(dirty: string): string {
  if (!purify) {
    const window = new JSDOM("").window as unknown as Window;
    purify = createDOMPurify(window);
  }
  return purify!.sanitize(dirty, {
    ALLOWED_ATTR: ["href", "title", "alt", "src", "target", "rel"],
    ALLOWED_TAGS: [
      "a","abbr","b","blockquote","br","code","em","i","img","li","ol","p","pre","strong","ul",
      "h1","h2","h3","h4","h5","h6","hr","table","thead","tbody","tr","th","td"
    ]
  }) as string;
}
"""

ARTICLE_PAGE_TSX = """import { notFound } from "next/navigation";
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
"""

def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")

def main() -> None:
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] Cartella webapp non trovata: {WEBAPP}")
    write(SANITIZE_PATH, SANITIZE_TS)
    print(f"[UP] scritto: {SANITIZE_PATH.relative_to(REPO)}")
    write(ARTICLE_PAGE_PATH, ARTICLE_PAGE_TSX)
    print(f"[UP] scritto: {ARTICLE_PAGE_PATH.relative_to(REPO)}")
    print("[DONE] PL-3 setup completato. Ricorda: hai già eseguito SQL + npm i.")

if __name__ == "__main__":
    main()
