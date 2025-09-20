# Tools/pl7_blog_categories_bootstrap.py
# PL-7: Blog categorie + singolo post pronto per indice/categoria (idempotente)

from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"

def ensure_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        # patch only if missing essential markers
        text = path.read_text(encoding="utf-8", errors="replace")
        if content.strip() not in text:
            path.write_text(content, encoding="utf-8")
    else:
        path.write_text(content, encoding="utf-8")

def upsert_i18n(locale: str, patch: dict):
    p = WEB / "messages" / f"{locale}.json"
    if not p.exists():
        return
    data = json.loads(p.read_text(encoding="utf-8", errors="replace") or "{}")
    data.setdefault("blog", {})
    for k, v in patch.get("blog", {}).items():
        data["blog"].setdefault(k, v)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def patch_single_post_page():
    p = WEB / "app" / "[locale]" / "blog" / "[slug]" / "page.tsx"
    if not p.exists():
        return  # lasciamo così, non forziamo se non esiste ancora
    src = p.read_text(encoding="utf-8", errors="replace")

    # 1) import CategoryBadge se manca
    if "CategoryBadge" not in src:
        src = src.replace(
            "from \"next/navigation\";",
            "from \"next/navigation\";\nimport CategoryBadge from \"@/components/ui/CategoryBadge\";",
        )

    # 2) blocco categorie sopra al titolo (se manca)
    if "/* __PL7_CATEGORIES__ */" not in src:
        src = src.replace(
            "<article",
            "<article",
            1,
        )
        # Inseriamo un blocco cerca h1 e prima del titolo aggiungiamo i badge
        src = re.sub(
            r"(<h1[^>]*>)",
            (
                "{post?.categories?.length ? (\n"
                "  <div className=\"mb-3 flex gap-2\">{/* __PL7_CATEGORIES__ */}\n"
                "    {post.categories.map((c:any)=> (\n"
                "      <CategoryBadge key={c.id} locale={params.locale} slug={c.slug} label={c.name || c.slug} />\n"
                "    ))}\n"
                "  </div>\n"
                ") : null}\n\\1"
            ),
            src,
            count=1,
        )

    # 3) metadata base se manca alternates/opengraph minimi
    if "generateMetadata" in src and "openGraph" not in src:
        src = re.sub(
            r"return\s*{([^}]+)};",
            r'return { \1, openGraph: { title: post.title, description: post.summary ?? undefined, type: "article" } };',
            src,
            count=1,
        )

    p.write_text(src, encoding="utf-8")

def write_badge():
    path = WEB / "components" / "ui" / "CategoryBadge.tsx"
    ensure_file(path, """\
import Link from "next/link";

export default function CategoryBadge({ locale, slug, label }:{
  locale: string; slug: string; label: string;
}) {
  return (
    <Link
      href={`/${locale}/blog/category/${slug}`}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
    >
      {label}
    </Link>
  );
}
""")

def write_category_page():
    path = WEB / "app" / "[locale]" / "blog" / "category" / "[slug]" / "page.tsx"
    ensure_file(path, """\
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
""")

def main():
    write_badge()
    write_category_page()
    patch_single_post_page()

    # i18n minime
    upsert_i18n("it", {"blog": {"category": "Categoria", "readMore": "Leggi di più", "allArticles": "Tutti gli articoli"}})
    upsert_i18n("en", {"blog": {"category": "Category", "readMore": "Read more", "allArticles": "All articles"}})

    print("[OK] PL-7 scaffold applicato (badge, pagina categoria, patch singolo post, i18n)")

if __name__ == "__main__":
    main()
