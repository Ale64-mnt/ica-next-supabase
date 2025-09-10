# Tools/setup_supabase_schema.py
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2

ROOT = Path(__file__).resolve().parents[1]
ENV_DB = ROOT / "webapp" / ".env.db"

def main():
    if not ENV_DB.exists():
        print(f"❌ {ENV_DB} non trovato. Crea il file e imposta SUPABASE_DB_URL.")
        sys.exit(1)

    load_dotenv(ENV_DB)
    db_url = os.getenv("SUPABASE_DB_URL")
    if not db_url:
        print("❌ Variabile SUPABASE_DB_URL mancante in .env.db")
        sys.exit(1)

    print("🔌 Connessione a Supabase Postgres…")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    sql = r"""
-- =========================================================
-- STORAGE: crea buckets idempotenti
-- =========================================================
insert into storage.buckets (id, name, public)
values ('images','images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('documents','documents', false)
on conflict (id) do nothing;

-- =========================================================
-- STORAGE POLICIES (idempotenti via blocco DO)
-- =========================================================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Public select images'
  ) then
    create policy "Public select images"
      on storage.objects
      for select
      to anon
      using (bucket_id = 'images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Auth insert images'
  ) then
    create policy "Auth insert images"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Auth update own images'
  ) then
    create policy "Auth update own images"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'images')
      with check (bucket_id = 'images');
  end if;

  -- Documents: visibili/gestibili solo da utenti autenticati
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Auth read documents'
  ) then
    create policy "Auth read documents"
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'documents');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename  = 'objects'
      and policyname = 'Auth write documents'
  ) then
    create policy "Auth write documents"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'documents');
  end if;
end
$$;

-- =========================================================
-- TABELLE: NEWS / ARTICLES con RLS
-- =========================================================
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  lang text not null default 'it',
  title text not null,
  summary text,
  body text,
  source text,
  source_date date,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  lang text not null default 'it',
  title text not null,
  subtitle text,
  body text,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Abilita RLS
alter table public.news enable row level security;
alter table public.articles enable row level security;

-- Policies idempotenti
do $$
begin
  -- NEWS: lettura pubblica solo pubblicate
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='news' and policyname='Public read news'
  ) then
    create policy "Public read news"
      on public.news
      for select
      to anon
      using (published = true);
  end if;

  -- NEWS: scrittura solo authenticated
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='news' and policyname='Auth write news'
  ) then
    create policy "Auth write news"
      on public.news
      for all
      to authenticated
      using (true)
      with check (true);
  end if;

  -- ARTICLES: lettura pubblica solo pubblicati
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Public read articles'
  ) then
    create policy "Public read articles"
      on public.articles
      for select
      to anon
      using (published = true);
  end if;

  -- ARTICLES: scrittura solo authenticated
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='articles' and policyname='Auth write articles'
  ) then
    create policy "Auth write articles"
      on public.articles
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end
$$;

-- Trigger aggiornamento updated_at (idempotente)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname='set_updated_at_news'
  ) then
    create trigger set_updated_at_news
      before update on public.news
      for each row execute procedure public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname='set_updated_at_articles'
  ) then
    create trigger set_updated_at_articles
      before update on public.articles
      for each row execute procedure public.set_updated_at();
  end if;
end
$$;
"""
    print("▶️  Eseguo DDL e policy…")
    cur.execute(sql)
    cur.close()
    conn.close()
    print("✅ Schema/Storage/Policy creati o già presenti.")

if __name__ == "__main__":
    main()
