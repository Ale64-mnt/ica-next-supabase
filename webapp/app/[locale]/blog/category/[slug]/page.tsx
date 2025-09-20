import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params:{ locale, slug } }:{
  params:{ locale:string; slug:string }
}) {
  const sb = supabaseBrowser();
  // usa una view se ce l'hai; altrimenti adatta con la tua tabella traduzioni
  const { data, error } = await sb
    .from("posts_by_category_view")
    .select("slug, title, summary, cover_url, published_at")
    .eq("locale", locale)
    .eq("category_slug", slug)
    .order("published_at", { ascending:false });

  if (error) {
    console.error(error);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{slug}</h1>
      <ul className="grid gap-8 md:grid-cols-2">
        {(data ?? []).map((p:any)=>(
          <li key={p.slug} className="group">
            <Link href={`/${locale}/blog/${p.slug}`}>
              <div className="space-y-2">
                {p.cover_url && <img src={p.cover_url} className="rounded-xl" alt="" />}
                <h2 className="text-xl font-semibold group-hover:underline">{p.title}</h2>
                {p.summary && <p className="text-slate-600">{p.summary}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
