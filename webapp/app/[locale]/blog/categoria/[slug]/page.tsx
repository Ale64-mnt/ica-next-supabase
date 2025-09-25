import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

type Row = { slug: string; title: string; summary: string | null; cover_url: string | null };

function localCover(cover: string | null, slug: string): string {
  if (cover && cover.startsWith("/")) return cover;
  return `/covers/${slug}.jpg`;
}

async function getData(category: string, locale: string) {
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,summary,cover_url")
    .eq("published", true)
    .eq("category", category)
    .eq("locale", locale)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Row[];
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const { locale, slug } = params;
  const title = locale === "en" ? `Category: ${slug} (en)` : `Categoria: ${slug} (${locale})`;
  const description = locale === "en" ? `Posts in category "${slug}".` : `Articoli nella categoria "${slug}".`;
  return { title, description };
}

export default async function CategoryPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const { locale, slug } = params;
  const items = await getData(slug, locale);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-6">
        {locale === "en" ? "Category" : "Categoria"}: {slug} ({locale})
      </h1>

      {items.length === 0 && (
        <p className="opacity-70">
          {locale === "en" ? "No posts in this category." : "Nessun articolo in questa categoria."}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => {
          const src = localCover(a.cover_url, a.slug);
          return (
            <article key={a.slug} className="rounded-2xl border p-4 hover:shadow-md transition">
              <div className="relative w-full h-40 mb-3">
                <Image
                  src={src}
                  alt={a.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover rounded-xl"
                />
              </div>
              <h2 className="text-lg font-semibold mt-1">
                <Link href={`/${locale}/blog/${a.slug}`} className="hover:underline">{a.title}</Link>
              </h2>
              {a.summary && <p className="text-sm mt-2 line-clamp-3">{a.summary}</p>}
            </article>
          );
        })}
      </div>
    </main>
  );
}
