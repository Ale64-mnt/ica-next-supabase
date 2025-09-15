import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewsDetail({ params }: { params: { locale: string; slug: string } }) {
  const supa = getSupabasePublicServer();
  const { data, error } = await supa
    .from("news")
    .select("id,title,body,source_url,cover_url,slug,published_at")
    .eq("slug", params.slug)
    .single();

  if (error || !data) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-sm text-gray-500">
          {data.published_at ? new Date(data.published_at).toLocaleString(params.locale) : "—"}
        </p>
      </header>

      {data.cover_url && (
        <img src={data.cover_url} alt="" className="w-full max-h-[420px] object-cover rounded-lg" />
      )}

      <article className="prose prose-neutral max-w-none">{data.body}</article>

      {data.source_url && (
        <p className="text-sm text-gray-600">
          Fonte: <a href={data.source_url} className="underline text-blue-600" target="_blank">{data.source_url}</a>
        </p>
      )}
    </main>
  );
}
