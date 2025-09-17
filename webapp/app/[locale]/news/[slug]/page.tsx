import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
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
