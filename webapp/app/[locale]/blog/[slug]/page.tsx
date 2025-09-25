import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

function localCover(cover: string | null, slug: string): string {
  if (cover && cover.startsWith("/")) return cover;
  return `/covers/${slug}.jpg`;
}

async function getSeo(slug: string) {
  const { data } = await supabase
    .from("articles")
    .select("title,summary,cover_url")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data ?? null;
}

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }): Promise<Metadata> {
  const d = await getSeo(params.slug);
  return {
    title: d?.title ?? "Articolo",
    description: d?.summary ?? undefined,
    openGraph: d ? { images: [{ url: localCover(d.cover_url ?? null, params.slug) }] } : undefined,
  };
}

async function getArticle(slug: string, locale: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,summary,body_md,cover_url,category,published_at,locale")
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}

export default async function BlogDetail({ params }: { params: { locale: string; slug: string } }) {
  const a = await getArticle(params.slug, params.locale);
  if (!a) return notFound();

  const src = localCover(a.cover_url, a.slug);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-xs opacity-70">{a.category} · {a.locale}</p>
      <h1 className="text-3xl font-bold mt-1">{a.title}</h1>

      <div className="relative w-full h-64 my-4">
        <Image
          src={src}
          alt={a.title}
          fill
          sizes="(min-width:1024px) 768px, 100vw"
          className="object-cover rounded-2xl"
        />
      </div>

      {a.summary && <p className="italic opacity-80">{a.summary}</p>}

      <article className="prose prose-neutral max-w-none mt-6">
        <ReactMarkdown>{a.body_md}</ReactMarkdown>
      </article>
    </main>
  );
}
