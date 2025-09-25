# Tools/db_insert_article.py
import os, argparse, re
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv(".env.db")
DB_URL = os.getenv("SUPABASE_DB_URL")
if not DB_URL:
    raise RuntimeError("SUPABASE_DB_URL non trovato in .env.db")

def slugify(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")

def read_body(body: str) -> str:
    # Se passi @file.md legge da file, altrimenti usa il testo così com'è
    if body.startswith("@"):
        p = Path(body[1:])
        return p.read_text(encoding="utf-8")
    return body

def upsert_article(slug, title, summary, body_md, cover_url, locale, publish):
    sql = """
    INSERT INTO public.articles (slug, title, summary_it, body_md, cover_url, locale, published_at)
    VALUES (%s, %s, %s, %s, %s, %s, CASE WHEN %s THEN NOW() ELSE NULL END)
    ON CONFLICT (slug) DO UPDATE
    SET title = EXCLUDED.title,
        summary_it = EXCLUDED.summary_it,
        body_md = EXCLUDED.body_md,
        cover_url = EXCLUDED.cover_url,
        locale = EXCLUDED.locale,
        published_at = CASE WHEN %s THEN NOW() ELSE public.articles.published_at END
    RETURNING id, slug, locale, published_at;
    """
    with psycopg2.connect(DB_URL) as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, (slug, title, summary, body_md, cover_url, locale, publish, publish))
        row = cur.fetchone()
        return row

if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Upsert articolo su Supabase/Postgres")
    ap.add_argument("--title", required=True)
    ap.add_argument("--slug", default="")
    ap.add_argument("--summary", default="")
    ap.add_argument("--body", required=True, help="Testo o @file.md")
    ap.add_argument("--cover", default="")
    ap.add_argument("--locale", default="it", choices=["it","en"])
    ap.add_argument("--publish", action="store_true")
    args = ap.parse_args()

    slug = args.slug or slugify(args.title)
    body_md = read_body(args.body)

    row = upsert_article(
        slug=slug,
        title=args.title,
        summary=args.summary,
        body_md=body_md,
        cover_url=args.cover,
        locale=args.locale,
        publish=args.publish,
    )
    url = f"/{row['locale']}/news/{row['slug']}"
    print(f"[OK] id={row['id']} | slug={row['slug']} | locale={row['locale']} | url={url} | published_at={row['published_at']}")
