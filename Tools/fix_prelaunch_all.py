# Tools/fix_prelaunch_all.py
# -*- coding: utf-8 -*-
"""
Fix prelaunch deterministico per Next.js + TS:
- Riscrive BasicPage.tsx (props stabili; locale opzionale)
- Riscrive NewsList.tsx (Client Component, locale?: 'it'|'en' + fallback useLocale)
- Riscrive app/[locale]/news/page.tsx (type-narrowing e pass locale)
- Normalizza "use client" in testa a vari componenti
- Rimuove BOM e salva UTF-8 (no BOM)
- Sostituisce image_url -> cover_url nei .ts/.tsx
- Idempotente e con backup .bak
"""
from __future__ import annotations
import re
import sys
import argparse
from pathlib import Path

ENC = "utf-8"

BASICPAGE_CONTENT = """\"use client\";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

export type BasicPageProps = {
  title?: string;
  intro?: string;
  namespace?: string;
  children?: ReactNode;
  // opzionale: lo accettiamo per compat, ma non lo usiamo
  locale?: string;
};

export default function BasicPage({
  title,
  intro,
  namespace,
  children,
}: BasicPageProps) {
  const t = namespace ? useTranslations(namespace) : null;
  const resolvedTitle = title ?? (t ? t("title") : "");
  const resolvedIntro = intro ?? (t ? t("intro") : "");

  return (
    <main className="container" style={{ padding: "2rem" }}>
      {resolvedTitle && <h1>{resolvedTitle}</h1>}
      {resolvedIntro && <p>{resolvedIntro}</p>}
      {children}
    </main>
  );
}
"""

NEWSLIST_CONTENT = """'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type SupportedLocale = 'it' | 'en';
type Props = { locale?: SupportedLocale };

type NewsItem = {
  id: string;
  title: string;
  summary?: string | null;
  cover_url?: string | null;
  slug?: string | null;
  locale?: string | null;
  published_at?: string | null;
};

export default function NewsList({ locale }: Props) {
  const fallback = useLocale() as SupportedLocale;
  const loc: SupportedLocale = (locale ?? fallback);

  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/news?locale=${loc}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Errore caricamento');
        setItems(json.items ?? []);
      } catch (e: any) {
        setError(e?.message ?? 'Errore inatteso');
      }
    })();
  }, [loc]);

  if (error) return <div style={{ color: 'crimson' }}>Errore: {error}</div>;
  if (!items) return <div>Caricamento…</div>;
  if (items.length === 0) return <div>Nessuna news disponibile.</div>;

  return (
    <ul style={{ display: 'grid', gap: '0.75rem', padding: 0, listStyle: 'none' }}>
      {items.map((n) => (
        <li key={n.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: '0.75rem' }}>
          <div style={{ fontWeight: 600 }}>{n.title}</div>
          {n.published_at && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {new Date(n.published_at).toISOString().slice(0, 10)}
            </div>
          )}
          {n.summary && <p style={{ marginTop: 6 }}>{n.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
"""

NEWS_PAGE_CONTENT = """import BasicPage from "@/components/BasicPage";
import NewsList from "@/components/NewsList";

type Props = { params: { locale: string } };
const supportedLocales = ['it', 'en'] as const;
type SupportedLocale = (typeof supportedLocales)[number];

export default function Page({ params: { locale } }: Props) {
  const isSupported = (supportedLocales as readonly string[]).includes(locale);
  const safeLocale = (isSupported ? locale : 'it') as SupportedLocale;

  return (
    <BasicPage namespace="news">
      <div style={{ padding: "0 2rem" }}>
        <NewsList locale={safeLocale} />
      </div>
    </BasicPage>
  );
}
"""

USE_CLIENT_TARGETS = [
    "components/AdminNewsForm.tsx",
    "components/ArticlesList.tsx",
    "components/AdminBlogForm.tsx",
    "components/NewsList.tsx",
]

def read_text(p: Path) -> str:
    return p.read_text(encoding=ENC) if p.exists() else ""

def write_text(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding=ENC, newline="\n")

def backup(p: Path):
    b = p.with_suffix(p.suffix + ".bak")
    if not b.exists() and p.exists():
        b.write_text(p.read_text(encoding=ENC), encoding=ENC, newline="\n")

def strip_bom_and_normalize_newlines(s: str) -> str:
    # rimuovi BOM se presente e normalizza \r\n -> \n
    if s.startswith("\ufeff"):
        s = s.lstrip("\ufeff")
    s = s.replace("\r\n", "\n")
    return s

def ensure_use_client_top(s: str) -> str:
    s = strip_bom_and_normalize_newlines(s)
    # rimuovi tutte le occorrenze di 'use client'
    s = re.sub(r'^\s*(["\'])use client\1;?\s*\n', "", s, flags=re.MULTILINE)
    # reinserisci in testa
    return "'use client';\n" + s.lstrip()

def replace_image_url_cover(s: str) -> str:
    return re.sub(r"\bimage_url\b", "cover_url", s)

def ensure_basicpage(root: Path, dry: bool, changed: list[Path]):
    p = root / "components" / "BasicPage.tsx"
    current = read_text(p)
    desired = strip_bom_and_normalize_newlines(BASICPAGE_CONTENT)
    if current != desired:
        if not dry:
            backup(p)
            write_text(p, desired)
        changed.append(p)

def ensure_newslist(root: Path, dry: bool, changed: list[Path]):
    p = root / "components" / "NewsList.tsx"
    desired = strip_bom_and_normalize_newlines(NEWSLIST_CONTENT)
    cur = read_text(p)
    cur2 = replace_image_url_cover(cur) if cur else cur
    # se il file esiste e differisce, scriviamo la versione “nota”
    if cur2 != desired:
        if not dry:
            backup(p)
            write_text(p, desired)
        changed.append(p)
    else:
        # comunque normalizza "use client" in testa
        normalized = ensure_use_client_top(cur2)
        if normalized != cur2 and not dry:
            backup(p)
            write_text(p, normalized)
            changed.append(p)

def ensure_news_page(root: Path, dry: bool, changed: list[Path]):
    p = root / "app" / "[locale]" / "news" / "page.tsx"
    desired = strip_bom_and_normalize_newlines(NEWS_PAGE_CONTENT)
    cur = read_text(p)
    # sostituisci eventualmente image_url -> cover_url
    cur2 = replace_image_url_cover(cur)
    if cur2 != desired:
        if not dry:
            backup(p)
            write_text(p, desired)
        changed.append(p)

def normalize_use_client_in_targets(root: Path, dry: bool, changed: list[Path]):
    for rel in USE_CLIENT_TARGETS:
        p = root / rel
        if not p.exists():
            continue
        cur = read_text(p)
        new = ensure_use_client_top(cur)
        new = replace_image_url_cover(new)
        if new != cur and not dry:
            backup(p)
            write_text(p, new)
            changed.append(p)

def global_image_url_replace(root: Path, dry: bool, changed: list[Path]):
    for p in root.rglob("*"):
        if not p.is_file(): continue
        if p.suffix not in (".ts", ".tsx"): continue
        if any(seg in p.parts for seg in ("node_modules", ".next", ".turbo")):
            continue
        cur = read_text(p)
        if "image_url" in cur:
            new = replace_image_url_cover(cur)
            if new != cur:
                if not dry:
                    backup(p)
                    write_text(p, new)
                changed.append(p)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="webapp", help="radice della webapp")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    changed: list[Path] = []

    ensure_basicpage(root, args.dry_run, changed)
    ensure_newslist(root, args.dry_run, changed)
    ensure_news_page(root, args.dry_run, changed)
    normalize_use_client_in_targets(root, args.dry_run, changed)
    global_image_url_replace(root, args.dry_run, changed)

    if args.dry_run:
        if changed:
            print("[DRY] Modificherei:")
            for p in changed:
                print("  -", p)
        else:
            print("[DRY] Nessuna modifica necessaria.")
    else:
        if changed:
            print("[OK] Modifiche applicate:")
            for p in changed:
                print("  -", p)
            print("\n[HINT] Ho creato i backup .bak accanto ai file toccati.")
        else:
            print("[OK] Nessuna modifica necessaria.")

if __name__ == "__main__":
    main()
