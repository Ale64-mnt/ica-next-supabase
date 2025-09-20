
# -*- coding: utf-8 -*-
"""
PL-4 – Applica stile editoriale minimale, sicuro per Tailwind v4:
- Crea componenti Editorial (CategoryBadge, ArticleHeader, ArticleBody con react-markdown)
- Aggiorna la pagina News dettaglio per usare i componenti
- Aggiunge CSS tipografico di base in globals.css (senza @apply / plugin)
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"

COMP_DIR = WEBAPP / "components"
UI_DIR = COMP_DIR / "ui"
EDITORIAL_TSX = COMP_DIR / "Editorial.tsx"
BADGE_TSX = UI_DIR / "CategoryBadge.tsx"
NEWS_PAGE = WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"
GLOBALS = WEBAPP / "app" / "globals.css"

EDITORIAL_CODE = r'''import Image from "next/image";
import React from "react";
import ReactMarkdown from "react-markdown";

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

export function ArticleHeader({
  title,
  date,
  badge,
  coverUrl,
  coverAlt,
}: {
  title: string;
  date?: string;
  badge?: React.ReactNode;
  coverUrl?: string | null;
  coverAlt?: string;
}) {
  return (
    <header className="space-y-3">
      {badge}
      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{title}</h1>
      {date ? <p className="text-sm text-gray-500">{date}</p> : null}
      {coverUrl ? (
        <figure className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={coverUrl}
              alt={coverAlt ?? title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={false}
            />
          </div>
        </figure>
      ) : null}
    </header>
  );
}

export function ArticleBody({ body }: { body: string | null }) {
  if (!body) return null;
  return (
    <article className="content">
      <ReactMarkdown>{body}</ReactMarkdown>
    </article>
  );
}
'''

BADGE_CODE = r'''import React from "react";

export default function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}
'''

NEWS_PAGE_CODE = r'''import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { notFound } from "next/navigation";
import { ArticleHeader, ArticleBody, CategoryBadge } from "@/components/Editorial";

export const dynamic = "force-dynamic";

export default async function NewsDetail({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const supa = getSupabasePublicServer();
  const { data, error } = await supa
    .from("news")
    .select("id,title,summary,body,source_url,cover_url,slug,published_at")
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
      <ArticleHeader
        title={data.title}
        date={dateStr}
        coverUrl={data.cover_url ?? undefined}
        badge={<CategoryBadge>News</CategoryBadge>}
      />
      {/* lead/summary se presente */}
      {data.summary ? (
        <p className="text-[18px] md:text-[20px] leading-[1.75] text-gray-700">{data.summary}</p>
      ) : null}
      {/* corpo formattato (Markdown) */}
      <ArticleBody body={data.body} />
      {/* fonte */}
      {data.source_url ? (
        <p className="text-sm text-gray-600">
          Fonte:{" "}
          <a href={data.source_url} className="underline text-blue-600" target="_blank" rel="noreferrer">
            {data.source_url}
          </a>
        </p>
      ) : null}
    </main>
  );
}
'''

CSS_SNIPPET = r'''
/* === Editorial basics (Tailwind v4-safe, no @apply) === */
.content {
  color: #1f2937; /* gray-800 */
  line-height: 1.75;
  font-size: 18px;
}
@media (min-width: 768px) {
  .content { font-size: 20px; }
}
.content p { margin: 1rem 0; }
.content h2 {
  margin: 1.5rem 0 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.25;
}
@media (min-width: 768px) {
  .content h2 { font-size: 1.75rem; }
}
.content h3 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.content ul, .content ol { margin: 1rem 0 1rem 1.25rem; }
.content li { margin: 0.375rem 0; }
.content a { color: #2563eb; text-decoration: underline; } /* blue-600 */
.content blockquote {
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 4px solid #e5e7eb; /* gray-200 */
  color: #4b5563; /* gray-600 */
}
'''

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")
    print(f"[UP] {path.relative_to(ROOT)}")

def ensure_css():
    if GLOBALS.exists():
        css = GLOBALS.read_text(encoding="utf-8")
        if "/* === Editorial basics" not in css:
            GLOBALS.write_text(css.rstrip() + "\n" + CSS_SNIPPET, encoding="utf-8", newline="\n")
            print(f"[UP] {GLOBALS.relative_to(ROOT)} (aggiunto blocco editoriale)")
        else:
            print(f"[OK] {GLOBALS.relative_to(ROOT)} già contiene il blocco editoriale")
    else:
        # crea base + snippet
        base = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
        GLOBALS.parent.mkdir(parents=True, exist_ok=True)
        GLOBALS.write_text(base + CSS_SNIPPET, encoding="utf-8", newline="\n")
        print(f"[NEW] {GLOBALS.relative_to(ROOT)} creato")

def main():
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] cartella webapp non trovata: {WEBAPP}")

    write(EDITORIAL_TSX, EDITORIAL_CODE)
    write(BADGE_TSX, BADGE_CODE)
    write(NEWS_PAGE, NEWS_PAGE_CODE)
    ensure_css()
    print("[DONE] Editorial style applicato alla pagina News.")

if __name__ == "__main__":
    main()
