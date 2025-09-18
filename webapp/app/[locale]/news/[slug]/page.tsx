// webapp/app/[locale]/news/[slug]/page.tsx
import Image from "next/image";
import EditorialLayout from "@/components/EditorialLayout";
import ArticleBody from "@/components/ArticleBody";
import { createClient } from "@/lib/supabaseServerPublic";

type Props = {
  params: { locale: string; slug: string };
};

export default async function NewsDetail({ params }: Props) {
  const { locale, slug } = params;
  const supabase = createClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, summary, body, cover_url, category, lang, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data || error || (data.lang && data.lang !== locale)) {
    return (
      <EditorialLayout>
        <div className="py-16">
          <h1 className="mb-2 text-2xl font-bold">Articolo non trovato</h1>
          <p className="text-neutral-600">Controlla lo slug o la lingua.</p>
        </div>
      </EditorialLayout>
    );
  }

  const src = data.cover_url || "https://placehold.co/1200x675/png?text=News";

  // Se in futuro converti Markdown -> HTML, metti l'HTML in "html" e togli "text"
  return (
    <EditorialLayout>
      <article className="py-8 sm:py-10">
        {data.category ? (
          <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#0f766e]">
            {data.category}
          </div>
        ) : null}

        <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
          {data.title || "Senza titolo"}
        </h1>

        {data.summary ? (
          <p className="mt-3 text-[18px] leading-relaxed text-neutral-700">
            {data.summary}
          </p>
        ) : null}

        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded">
          <Image
            src={src}
            alt={data.title || "News"}
            fill
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
            priority
          />
        </div>

        <div className="mt-8">
          <ArticleBody text={data.body} />
        </div>
      </article>
    </EditorialLayout>
  );
}
