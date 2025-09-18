import EditorialLayout from "@/components/EditorialLayout";
import ArticleCard from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import { createClient } from "@supabase/supabase-js";

type NewsRow = {
  id: string | number;
  slug: string;
  title: string | null;
  summary: string | null;
  lang: string | null;
};

type Props = { params: { locale: string } };

export default async function HomePage({ params }: Props) {
  const t = await getTranslations("home");
  const locale = params.locale;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnon);

  try {
    const { data, error } = await supabase
      .from("news")
      .select("id, slug, title, summary, lang")
      .order("id", { ascending: false })
      .limit(6);

    if (error) {
      console.error("[HOME] Supabase error:", error);
      return (
        <EditorialLayout>
          <section className="py-8 sm:py-10">
            <h1 className="mb-6 text-3xl font-extrabold">{t("title")}</h1>
            <p className="text-red-600">Errore nel caricamento delle news.</p>
          </section>
        </EditorialLayout>
      );
    }

    const rows: NewsRow[] = (data as any[]) ?? [];
    const items = rows
      .filter((n) => !n.lang || n.lang === locale)
      .map((n) => ({
        href: `/${locale}/news/${n.slug}`,
        title: n.title ?? "Senza titolo",
        summary: n.summary ?? null,
        // colonne non presenti al momento
        category: null,
        coverUrl: null,
      }));

    return (
      <EditorialLayout>
        <section className="py-8 sm:py-10">
          <h1 className="mb-6 text-3xl font-extrabold">{t("title")}</h1>
          <p className="mb-8 text-[18px] text-neutral-700">{t("intro")}</p>

          <div className="grid gap-6">
            {items.length === 0 ? (
              <p className="text-neutral-600">{t("empty")}</p>
            ) : (
              items.map((it) => <ArticleCard key={it.href} {...it} />)
            )}
          </div>
        </section>
      </EditorialLayout>
    );
  } catch (e) {
    console.error("[HOME] Unexpected error:", e);
    return (
      <EditorialLayout>
        <section className="py-8 sm:py-10">
          <h1 className="mb-6 text-3xl font-extrabold">{t("title")}</h1>
          <p className="text-red-600">Errore imprevisto nel caricamento.</p>
        </section>
      </EditorialLayout>
    );
  }
}
