# tools/fix_home_hard_overwrite.py
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"

PAGE = WEBAPP / "app" / "[locale]" / "page.tsx"
CARD = WEBAPP / "components" / "ArticleCard.tsx"
PUBLIC = WEBAPP / "public"

PAGE_SRC = """import EditorialLayout from "@/components/EditorialLayout";
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
"""

CARD_SRC_IF_MISSING = """// webapp/components/ArticleCard.tsx
import Link from "next/link";
import Image from "next/image";

type Props = {
  href: string;
  title: string;
  summary?: string | null;
  category?: string | null;
  coverUrl?: string | null;
};

export default function ArticleCard({ href, title, summary, category, coverUrl }: Props) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      {coverUrl ? (
        <div className="mb-3 overflow-hidden rounded-md">
          <Image
            src={coverUrl}
            alt={title}
            width={1200}
            height={630}
            className="h-auto w-full"
            priority={false}
          />
        </div>
      ) : null}

      {category ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {category}
        </div>
      ) : null}

      <h3 className="text-xl font-bold leading-tight">
        <Link href={href} className="hover:underline">
          {title}
        </Link>
      </h3>

      {summary ? (
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-700">{summary}</p>
      ) : null}
    </article>
  );
}
"""

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")
    print(f"[OK] write: {path.relative_to(REPO)}")

def ensure_card_optional_props():
    if not CARD.exists():
        write(CARD, CARD_SRC_IF_MISSING)
        return
    src = CARD.read_text(encoding="utf-8")
    changed = src
    changed = changed.replace("category: string;", "category?: string | null;")
    changed = changed.replace("coverUrl: string;", "coverUrl?: string | null;")
    if changed != src:
        CARD.write_text(changed, encoding="utf-8", newline="\n")
        print(f"[OK] patched props in: {CARD.relative_to(REPO)}")
    else:
        print(f"[OK] card already compatible: {CARD.relative_to(REPO)}")

def ensure_favicon():
    ico = PUBLIC / "favicon.ico"
    if ico.exists():
        print("[OK] favicon.ico presente")
        return
    logo = PUBLIC / "logo.png"
    if logo.exists():
        ico.write_bytes(logo.read_bytes())
        print("[OK] favicon.ico creato copiando logo.png")
    else:
        print("[WARN] nessun logo.png: favicon non creata")

def main():
    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] cartella webapp non trovata: {WEBAPP}")
    write(PAGE, PAGE_SRC)
    ensure_card_optional_props()
    ensure_favicon()
    print("[DONE] Hard overwrite page.tsx + card compat")

if __name__ == "__main__":
    main()
