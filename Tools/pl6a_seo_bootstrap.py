# -*- coding: utf-8 -*-
"""
pl6a_seo_bootstrap.py
Crea/aggiorna i file per PL-6a: sitemap, robots, hreflang alternates nel layout locale.
- Crea webapp/app/sitemap.ts
- Crea webapp/app/robots.ts
- Parcha webapp/app/[locale]/layout.tsx per alternates hreflang (generateMetadata) se manca
- Aggiunge placeholder env NEXT_PUBLIC_SITE_URL se assente
Idempotente.
Exit: 0 OK, 1 WARN (patch applicate), 2 ERROR (I/O)
"""
from __future__ import annotations
import sys
from pathlib import Path
import re

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"

ENV_PATH = WEBAPP / ".env.local"
SITEMAP = WEBAPP / "app" / "sitemap.ts"
ROBOTS = WEBAPP / "app" / "robots.ts"
LAYOUT = WEBAPP / "app" / "[locale]" / "layout.tsx"

SITEMAP_TS = (
    "import type { MetadataRoute } from 'next';\n\n"
    "type NewsRow = { slug: string; lang: string };\n"
    "const LOCALES = ['it','en'] as const;\n\n"
    "async function fetchNews(): Promise<NewsRow[]> {\n"
    "  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;\n"
    "  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;\n"
    "  if (!base || !anon) return [];\n"
    "  const url = `${base}/rest/v1/news?select=slug,lang`;\n"
    "  const r = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, next: { revalidate: 60 } });\n"
    "  if (!r.ok) return [];\n"
    "  return r.json();\n"
    "}\n\n"
    "export default async function sitemap(): Promise<MetadataRoute.Sitemap> {\n"
    "  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');\n"
    "  const now = new Date();\n"
    "  const baseEntries: MetadataRoute.Sitemap = LOCALES.map(l => ({\n"
    "    url: `${site}/${l}`, lastModified: now, changeFrequency: 'daily', priority: 0.8,\n"
    "  }));\n"
    "  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap(l => ([\n"
    "    { url: `${site}/${l}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },\n"
    "    { url: `${site}/${l}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },\n"
    "  ]));\n"
    "  const news = await fetchNews();\n"
    "  const newsEntries: MetadataRoute.Sitemap = news.map(n => ({\n"
    "    url: `${site}/${n.lang}/news/${encodeURIComponent(n.slug)}`,\n"
    "    lastModified: now, changeFrequency: 'weekly', priority: 0.6,\n"
    "  }));\n"
    "  return [...baseEntries, ...staticEntries, ...newsEntries];\n"
    "}\n"
)

ROBOTS_TS = (
    "import type { MetadataRoute } from 'next';\n\n"
    "export default function robots(): MetadataRoute.Robots {\n"
    "  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');\n"
    "  return {\n"
    "    rules: [{ userAgent: '*', allow: '/' }],\n"
    "    sitemap: `${site}/sitemap.xml`,\n"
    "    host: site,\n"
    "  };\n"
    "}\n"
)

def ensure_file(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path}"

def ensure_env_site_url(env_path: Path) -> str:
    lines = []
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()
    keys = {(ln.split("=", 1)[0].strip() if "=" in ln else "") for ln in lines if ln.strip() and not ln.strip().startswith("#")}
    if "NEXT_PUBLIC_SITE_URL" in keys:
        return "ENV OK"
    lines.append("NEXT_PUBLIC_SITE_URL=https://www.tuodominio.tld")
    env_path.parent.mkdir(parents=True, exist_ok=True)
    env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return "ENV+ NEXT_PUBLIC_SITE_URL"

def patch_layout_hreflang(layout_path: Path) -> list[str]:
    logs: list[str] = []
    if not layout_path.exists():
        return [f"MISS {layout_path}"]
    txt = layout_path.read_text(encoding="utf-8")

    # 1) ensure LOCALES const
    if "const LOCALES" not in txt:
        txt = txt.replace(
            "export async function generateStaticParams()",
            "const LOCALES = ['it','en'] as const;\n\nexport async function generateStaticParams()"
        )
        logs.append("ADD LOCALES")

    # 2) ensure generateMetadata with alternates
    if "export async function generateMetadata" not in txt:
        gen = (
            "\n\nexport async function generateMetadata({ params }: any) {\n"
            "  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');\n"
            "  const alternates: Record<string, string> = Object.fromEntries((LOCALES as readonly string[]).map(l => [l, `${site}/${l}`]));\n"
            "  return { alternates: { languages: alternates } } as any;\n"
            "}\n"
        )
        txt = txt + gen
        logs.append("ADD generateMetadata alternates")
    else:
        # se esiste, assicurati che contenga alternates.languages
        if ("alternates" not in txt) or ("languages" not in txt):
            txt = re.sub(
                r"export async function generateMetadata[\s\S]*?\{[\s\S]*?return\s*\{",
                "export async function generateMetadata({ params }: any) {\n  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');\n  const alternates: Record<string, string> = Object.fromEntries((LOCALES as readonly string[]).map(l => [l, `${site}/${l}`]));\n  return { alternates: { languages: alternates },",
                txt,
                count=1
            )
            logs.append("PATCH generateMetadata alternates")

    layout_path.write_text(txt, encoding="utf-8")
    return logs if logs else ["OK layout"]

def main() -> int:
    changes: list[str | list[str]] = []
    changes.append(ensure_file(SITEMAP, SITEMAP_TS))
    changes.append(ensure_file(ROBOTS, ROBOTS_TS))
    changes.extend(patch_layout_hreflang(LAYOUT))
    changes.append(ensure_env_site_url(ENV_PATH))

    print("=== pl6a_seo_bootstrap ===")
    for c in changes:
        if isinstance(c, list):
            for i in c:
                print(i)
        else:
            print(c)
    any_change = False
    for c in changes:
        if isinstance(c, str):
            if c.startswith(("CREATE", "ADD", "PATCH", "ENV+")):
                any_change = True
        elif isinstance(c, list):
            if any(isinstance(i, str) and i.startswith(("CREATE", "ADD", "PATCH", "ENV+")) for i in c):
                any_change = True
    return 1 if any_change else 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print("[ERROR]", e)
        sys.exit(2)
