# tools/pl4_fix_news_template.py
# -*- coding: utf-8 -*-
"""
PL-4 – Fix template News dettaglio (safe placeholders):
- Riscrive webapp/app/[locale]/news/[slug]/page.tsx
- Mostra titolo, data, cover, standfirst (primo paragrafo) e corpo tipografico.
- Se esiste components/ui/CategoryTag.tsx lo usa per il badge.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
NEWS_PAGE = WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"
CATEGORY_TAG = WEBAPP / "components" / "ui" / "CategoryTag.tsx"

PAGE_TSX = """import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";
import { notFound } from "next/navigation";
import Image from "next/image";
%%CATEGORY_IMPORT%%

export const dynamic = "force-dynamic";

export default async function NewsDetail({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const supa = getSupabasePublicServer();
  const { data, error } = await supa
    .from("news")
    .select("id,title,body,source_url,cover_url,slug,published_at")
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

  // Standfirst = primo paragrafo (se esiste)
  const paragraphs = (data.body ?? "").split("\\n\\n").filter(Boolean);
  const lead = paragraphs.length ? paragraphs[0] : "";
  const rest = paragraphs.length > 1 ? paragraphs.slice(1) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-8 md:py-12 space-y-6">
      <header className="space-y-3">
        %%CATEGORY_TAG%%
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{data.title}</h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
      </header>

      {data.cover_url && (
        <figure className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={data.cover_url}
              alt={data.title ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority={false}
            />
          </div>
        </figure>
      )}

      {lead && <p className="lead">{lead}</p>}

      {rest.length > 0 && (
        <article className="prose prose-neutral md:prose-lg max-w-none">
          {rest.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      )}

      {data.source_url && (
        <p className="text-sm text-gray-600">
          Fonte:{" "}
          <a href={data.source_url} className="underline text-blue-600" target="_blank" rel="noreferrer">
            {data.source_url}
          </a>
        </p>
      )}
    </main>
  );
}
"""

EXTRA_CSS = """
/* News lead paragraph (occhiello) */
.lead {
  @apply text-lg md:text-xl text-gray-700 leading-relaxed;
}
"""

def main() -> None:
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] Cartella webapp non trovata: {WEBAPP}")

    has_tag = CATEGORY_TAG.exists()
    category_import = 'import CategoryTag from "@/components/ui/CategoryTag";' if has_tag else ""
    category_tag = "<CategoryTag>News</CategoryTag>" if has_tag else '<span className="uppercase tracking-wide text-[11px] md:text-xs font-semibold text-white bg-orange-500 px-2.5 py-1 rounded-md inline-block">News</span>'

    page_src = (
        PAGE_TSX
        .replace("%%CATEGORY_IMPORT%%", category_import)
        .replace("%%CATEGORY_TAG%%", category_tag)
    )

    NEWS_PAGE.parent.mkdir(parents=True, exist_ok=True)
    NEWS_PAGE.write_text(page_src, encoding="utf-8", newline="\n")
    print(f"[UP] {NEWS_PAGE.relative_to(ROOT)}")

    globals_css = WEBAPP / "app" / "globals.css"
    if globals_css.exists():
        css = globals_css.read_text(encoding="utf-8")
        if ".lead" not in css:
            globals_css.write_text(css.rstrip() + "\n" + EXTRA_CSS, encoding="utf-8", newline="\n")
            print(f"[UP] {globals_css.relative_to(ROOT)} (aggiunto stile .lead)")
        else:
            print(f"[OK] {globals_css.relative_to(ROOT)} già contiene .lead")
    else:
        globals_css.parent.mkdir(parents=True, exist_ok=True)
        globals_css.write_text("@tailwind base;\n@tailwind components;\n@tailwind utilities;\n" + EXTRA_CSS, encoding="utf-8", newline="\n")
        print(f"[NEW] {globals_css.relative_to(ROOT)} creato con base + .lead")

    print("[DONE] Template News aggiornato (titolo, data, cover, standfirst, corpo).")

if __name__ == "__main__":
    main()
