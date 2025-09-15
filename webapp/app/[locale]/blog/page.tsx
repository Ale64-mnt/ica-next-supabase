import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";

const PAGE_SIZE = 10;

function getPage(searchParams: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const n = Number(raw ?? "1");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export const dynamic = "force-dynamic";

export default async function BlogListPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations("blog");
  const page = getPage(searchParams);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supa = getSupabasePublicServer();

  const { data: items, error } = await supa
    .from("articles")
    .select("id,title,excerpt,slug,cover_url,published_at", { count: "exact" })
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    // se c'è un problema DB, meglio un 404 pulito che rompere la pagina
    notFound();
  }

  const total = (items as any)?.length ?? 0;
  const showPrev = page > 1;
  const showNext = total === PAGE_SIZE; // semplice euristica

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("intro")}</p>
      </header>

      {(!items || items.length === 0) && (
        <p className="text-gray-500">{t("empty")}</p>
      )}

      <ul className="space-y-6">
        {items?.map((p) => (
          <li key={p.id} className="border rounded-lg p-4 flex gap-4">
            {p.cover_url ? (
              <img
                src={p.cover_url}
                alt={p.title}
                className="w-28 h-28 object-cover rounded"
              />
            ) : (
              <div className="w-28 h-28 rounded bg-gray-100" />
            )}
            <div className="flex-1">
              <Link
                href={`/${params.locale}/blog/${p.slug}`}
                className="text-xl font-semibold hover:underline"
              >
                {p.title}
              </Link>
              <p className="text-gray-600 mt-1 line-clamp-3">{p.excerpt}</p>
              <p className="text-xs text-gray-400 mt-2">
                {p.published_at
                  ? new Date(p.published_at).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <nav className="flex items-center justify-between pt-4">
        <div>
          {showPrev && (
            <Link
              href={`/${params.locale}/blog?page=${page - 1}`}
              className="px-3 py-1 border rounded"
            >
              ← {t("prev")}
            </Link>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {t("page")} {page}
        </div>
        <div>
          {showNext && (
            <Link
              href={`/${params.locale}/blog?page=${page + 1}`}
              className="px-3 py-1 border rounded"
            >
              {t("next")} →
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
