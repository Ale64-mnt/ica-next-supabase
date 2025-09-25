# Tools/db_maintain.py
# Utility DB (Postgres Supabase) per inserire/aggiornare articoli dal PC.

import os
import sys
import argparse
import datetime as dt
from pathlib import Path
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
load_dotenv(".env.db")

DB_URL = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
if not DB_URL:
    print("[ERR] Variabile SUPABASE_DB_URL (o DATABASE_URL) non trovata. Mettila in .env.db e fai `dotenv` se usi direnv, oppure esportala.")
    sys.exit(2)

def conn():
    return psycopg2.connect(DB_URL)

def ensure_schema():
    """Garantisce vincoli minimi: UNIQUE(slug, locale) e colonna category."""
    sql = """
    DO $$
    BEGIN
        -- colonna category se manca
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'category'
        ) THEN
            ALTER TABLE public.articles ADD COLUMN category text DEFAULT 'blog';
        END IF;

        -- indice/vincolo unico su (slug, locale)
        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public' AND indexname = 'ux_articles_slug_locale'
        ) THEN
            CREATE UNIQUE INDEX ux_articles_slug_locale ON public.articles (slug, locale);
        END IF;
    END$$;
    """
    with conn() as cx, cx.cursor() as cur:
        cur.execute(sql)
    print("[OK] Schema controllato/aggiornato.")

def read_body(body_text: str | None, body_file: str | None) -> str:
    if body_file:
        p = Path(body_file)
        if not p.exists():
            raise FileNotFoundError(f"Body file non trovato: {p}")
        return p.read_text(encoding="utf-8")
    return body_text or ""

def upsert_article(
    slug: str,
    locale: str,
    title: str,
    summary: str,
    body_text: str | None,
    body_file: str | None,
    category: str = "blog",
    cover_url: str | None = None,
    published_at: str | None = None,
):
    body_md = read_body(body_text, body_file)
    # published_at: ISO, es. "2025-09-20T10:30:00" oppure solo data
    pub = None
    if published_at:
        pub = dt.datetime.fromisoformat(published_at)

    sql = """
    INSERT INTO public.articles (slug, locale, title, summary, body_md, cover_url, category, published_at)
    VALUES (%(slug)s, %(locale)s, %(title)s, %(summary)s, %(body_md)s, %(cover_url)s, %(category)s, COALESCE(%(published_at)s, NOW()))
    ON CONFLICT (slug, locale) DO UPDATE SET
        title        = EXCLUDED.title,
        summary      = EXCLUDED.summary,
        body_md      = EXCLUDED.body_md,
        cover_url    = EXCLUDED.cover_url,
        category     = EXCLUDED.category,
        published_at = COALESCE(EXCLUDED.published_at, public.articles.published_at);
    """
    data = dict(
        slug=slug,
        locale=locale,
        title=title,
        summary=summary,
        body_md=body_md,
        cover_url=cover_url,
        category=category,
        published_at=pub,
    )
    with conn() as cx, cx.cursor() as cur:
        cur.execute(sql, data)
    print(f"[OK] Upsert articolo: {locale}/{slug} (cat: {category})")

def delete_by_slug(slug: str, locale: str | None):
    if locale:
        sql = "DELETE FROM public.articles WHERE slug=%s AND locale=%s"
        params = (slug, locale)
    else:
        sql = "DELETE FROM public.articles WHERE slug=%s"
        params = (slug,)

    with conn() as cx, cx.cursor() as cur:
        cur.execute(sql, params)
        print(f"[OK] Eliminati {cur.rowcount} record per slug='{slug}'{(' locale='+locale) if locale else ''}")

def list_articles(category: str | None = None):
    sql = "SELECT id, slug, locale, title, category, published_at FROM public.articles"
    if category:
        sql += " WHERE category=%s ORDER BY published_at DESC NULLS LAST"
        params = (category,)
    else:
        sql += " ORDER BY published_at DESC NULLS LAST"
        params = ()
    with conn() as cx, cx.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
        cur.execute(sql, params)
        for r in cur.fetchall():
            print(tuple(r))

def main():
    ap = argparse.ArgumentParser(description="DB maintain (articles)")
    ap.add_argument("--ensure-schema", action="store_true", help="crea vincoli e colonna category se mancanti")
    ap.add_argument("--list", nargs="?", const="*", help="lista articoli (opzionalmente filtra per category)")
    ap.add_argument("--delete-by-slug", nargs="+", help="slug [locale] : elimina un articolo (o tutte le lingue)")
    ap.add_argument("--upsert-article", action="store_true", help="inserisce/aggiorna un articolo")

    # campi upsert
    ap.add_argument("--slug")
    ap.add_argument("--locale")
    ap.add_argument("--title")
    ap.add_argument("--summary", default="")
    ap.add_argument("--body", help="body inline (markdown)")
    ap.add_argument("--body-file", help="path file markdown (UTF-8)")
    ap.add_argument("--category", default="blog")
    ap.add_argument("--cover-url")
    ap.add_argument("--published-at", help="ISO datetime es. 2025-09-20T10:30:00")

    args = ap.parse_args()

    if args.ensure_schema:
        ensure_schema()

    if args.list is not None:
        cat = None if args.list in (None, "*") else args.list
        list_articles(cat)

    if args.delete_by_slug:
        slug = args.delete_by_slug[0]
        locale = args.delete_by_slug[1] if len(args.delete_by_slug) > 1 else None
        delete_by_slug(slug, locale)

    if args.upsert_article:
        required = ("slug", "locale", "title")
        missing = [k for k in required if getattr(args, k) in (None, "")]
        if missing:
            print(f"[ERR] mancano parametri: {', '.join(missing)}")
            return 2
        upsert_article(
            slug=args.slug,
            locale=args.locale,
            title=args.title,
            summary=args.summary or "",
            body_text=args.body,
            body_file=args.body_file,
            category=args.category,
            cover_url=args.cover_url,
            published_at=args.published_at,
        )

if __name__ == "__main__":
    sys.exit(main() or 0)
