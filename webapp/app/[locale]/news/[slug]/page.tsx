import Image from "next/image";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

function localCover(cover: string | null, slug: string): string {
  if (cover && cover.startsWith("/")) return cover;
  return `/covers/${slug}.jpg`;
}

async function getNews(slug: string, locale: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,summary,body_md,cover_url,locale,category,published")
    .eq("slug", slug)
    .eq("locale", locale)
    .eq("published", true)
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}

export default async function NewsDetail({ params }: { params: { locale: string; slug: string } }) {
  const data = await getNews(params.slug, params.locale);
  if (!data) return notFound();

  const src = localCover(data.cover_url, data.slug);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <p className="text-xs opacity-70">{data.category} · {data.locale}</p>
      <h1 className="text-3xl font-bold mt-1">{data.title}</h1>

      <div className="relative w-full h-64 my-4">
        <Image
          src={src}
          alt={data.title}
          fill
          sizes="(min-width:1024px) 768px, 100vw"
          className="object-cover rounded-2xl"
          onError={(e) => { (e.currentTarget as any).src = "/covers/placeholder.svg"; }}
        />
      </div>

      {data.summary && <p className="italic opacity-80">{data.summary}</p>}
      {/* Render del body_md se necessario */}
    </main>
  );
}
