# tools/fix_preview_and_home.py
# -*- coding: utf-8 -*-
"""
Patch deterministica:
- Riscrive app/[locale]/page.tsx per usare @supabase/supabase-js (no supabaseServerPublic)
- Crea app/[locale]/preview/page.tsx
- Crea components/EditorialPreview.tsx se mancante
- Assicura placehold.co in next.config.mjs (images.remotePatterns)
- Git add/commit automatico
"""

from pathlib import Path
import re
import subprocess
import sys
import textwrap

ROOT = Path(__file__).resolve().parents[1]

HOME_PATH = ROOT / "webapp" / "app" / "[locale]" / "page.tsx"
PREVIEW_PAGE_PATH = ROOT / "webapp" / "app" / "[locale]" / "preview" / "page.tsx"
PREVIEW_COMP_PATH = ROOT / "webapp" / "components" / "EditorialPreview.tsx"
NEXT_CONFIG = ROOT / "webapp" / "next.config.mjs"

HOME_SRC = textwrap.dedent("""\
import EditorialLayout from "@/components/EditorialLayout";
import ArticleCard from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

type Props = {
  params: { locale: string };
};

export default async function HomePage({ params }: Props) {
  const t = await getTranslations("home");
  const locale = params.locale;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createSupabaseClient(supabaseUrl, supabaseAnon);

  const { data, error } = await supabase
    .from("news")
    .select("id, slug, title, summary, cover_url, category, lang")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return (
      <EditorialLayout>
        <section className="py-8 sm:py-10">
          <h1 className="mb-6 text-3xl font-extrabold">{t("title")}</h1>
          <p className="text-red-600">Errore nel caricamento delle news.</p>
        </section>
      </EditorialLayout>
    );
  }

  const items =
    (data || [])
      .filter((n) => !n.lang || n.lang === locale)
      .map((n) => ({
        href: `/${locale}/news/${n.slug}`,
        title: n.title || "Senza titolo",
        summary: n.summary || null,
        category: (n as any).category || null,
        coverUrl: (n as any).cover_url || null,
      }));

  return (
    <EditorialLayout>
      <section className="py-8 sm:py-10">
        <h1 className="mb-6 text-3xl font-extrabold">{t("title")}</h1>
        <p className="mb-8 text-[18px] text-neutral-700">{t("intro")}</p>

        <div>
          {items.length === 0 ? (
            <p className="text-neutral-600">{t("empty")}</p>
          ) : (
            items.map((it) => <ArticleCard key={it.href} {...it} />)
          )}
        </div>
      </section>
    </EditorialLayout>
  );
}
""")

PREVIEW_PAGE_SRC = textwrap.dedent("""\
// webapp/app/[locale]/preview/page.tsx
import type { Metadata } from "next";
import EditorialPreview from "@/components/EditorialPreview";

export const metadata: Metadata = {
  title: "Anteprima editoriale",
  description: "Preview dello stile editoriale per contenuti News/Blog.",
};

export default function PreviewPage() {
  return <EditorialPreview />;
}
""")

PREVIEW_COMP_SRC = textwrap.dedent("""\
'use client';

export default function EditorialPreview() {
  return (
    <div className="content max-w-[720px] mx-auto px-4 py-8">
      <h2>Educazione Digitale: Una Sfida Attuale</h2>
      <p>
        L’educazione digitale non è più un <strong>lusso</strong>, ma una necessità.
        Le scuole e le imprese devono aggiornarsi costantemente per rimanere competitive.
      </p>

      <h3>Perché è importante?</h3>
      <p>
        Conoscere gli strumenti digitali significa saper navigare in sicurezza,
        comunicare in modo efficace e sfruttare le nuove opportunità di lavoro.
      </p>

      <blockquote>
        “L’alfabetizzazione digitale è oggi una competenza trasversale fondamentale.”
      </blockquote>

      <h3>Benefici principali</h3>
      <ul>
        <li>Maggiore accesso alle risorse</li>
        <li>Collaborazione più semplice</li>
        <li>Nuove opportunità di apprendimento</li>
      </ul>

      <p>
        Scopri di più sul sito ufficiale:&nbsp;
        <a href="https://ec.europa.eu" target="_blank" rel="noreferrer">
          Commissione Europea
        </a>.
      </p>
    </div>
  );
}
""")

def write(path: Path, src: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(src, encoding="utf-8", newline="\n")
    print(f"[OK] write: {path.relative_to(ROOT)}")

def ensure_placehold_in_next_config():
    if not NEXT_CONFIG.exists():
        # crea un next.config minimale con placehold.co
        base = textwrap.dedent("""\
        /** @type {import('next').NextConfig} */
        const nextConfig = {
          images: {
            remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
          },
        };
        export default nextConfig;
        """)
        write(NEXT_CONFIG, base)
        return

    text = NEXT_CONFIG.read_text(encoding="utf-8")
    if "placehold.co" in text:
        print("[OK] next.config.mjs già include placehold.co")
        return

    # prova a patchare images.remotePatterns in modo semplice
    if "images:" in text:
        # inserisce un pattern in images
        patched = re.sub(
            r"images\s*:\s*\{([^}]*)\}",
            lambda m: f"images: {{{m.group(1)}\n    , remotePatterns: [{{ protocol: 'https', hostname: 'placehold.co' }}] }}",
            text,
            count=1,
            flags=re.S,
        )
        if patched != text:
            NEXT_CONFIG.write_text(patched, encoding="utf-8", newline="\n")
            print("[OK] patch next.config.mjs (aggiunto placehold.co in images)")
            return

    # fallback: append un blocco images
    appended = text.rstrip() + "\n\n// appended by fix_preview_and_home\n" + \
        "const _img = (cfg) => ({...cfg, images: { ...(cfg.images||{}), remotePatterns: [ ...(cfg.images?.remotePatterns||[]), { protocol: 'https', hostname: 'placehold.co' } ] }});\n" + \
        "export default _img(typeof nextConfig !== 'undefined' ? nextConfig : {});\n"
    NEXT_CONFIG.write_text(appended, encoding="utf-8", newline="\n")
    print("[OK] append next.config.mjs (aggiunto placehold.co)")

def git(cmd):
    print("[GIT]", " ".join(cmd))
    return subprocess.call(["git", *cmd], cwd=ROOT)

def main():
    # 1) riscrivi Home
    write(HOME_PATH, HOME_SRC)
    # 2) crea preview page
    write(PREVIEW_PAGE_PATH, PREVIEW_PAGE_SRC)
    # 3) crea preview component se manca (o aggiorna)
    if not PREVIEW_COMP_PATH.exists():
        write(PREVIEW_COMP_PATH, PREVIEW_COMP_SRC)
    else:
        print(f"[OK] exists: {PREVIEW_COMP_PATH.relative_to(ROOT)}")

    # 4) assicura placehold.co
    ensure_placehold_in_next_config()

    # 5) git add/commit
    files = [
        str(HOME_PATH.relative_to(ROOT)),
        str(PREVIEW_PAGE_PATH.relative_to(ROOT)),
        str(PREVIEW_COMP_PATH.relative_to(ROOT)),
        str(NEXT_CONFIG.relative_to(ROOT)),
    ]
    git(["add", *files])
    git(["commit", "-m", "Fix Home (supabase-js), add /[locale]/preview and EditorialPreview, ensure placehold.co"])
    print("[DONE] Patch applicata. Riavvia `npm run dev`.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
