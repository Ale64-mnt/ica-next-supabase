# coding: utf-8
"""
Crea/aggiorna lo schema base su Supabase:
- Estensioni
- Tabelle: news, articles, documents, downloads
- Storage buckets: images, documents
- RLS + policy (lettura pubblica, scrittura autenticati)
È idempotente: si può rieseguire senza effetti collaterali.

Legge la stringa di connessione da webapp/.env.db (SUPABASE_DB_URL).
"""

import os
import sys
from pathlib import Path
import psycopg2
from psycopg2.extras import RealDictCursor

ROOT = Path(__file__).resolve().parents[1]
ENV_DB = ROOT / "webapp" / ".env.db"

def load_db_url():
    if not ENV_DB.exists():
        print(f"❌ File non trovato: {ENV_DB}")
        sys.exit(1)

    db_url = None
    for line in ENV_DB.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("SUPABASE_DB_URL="):
            db_url = line.split("=", 1)[1].strip()
            break

    if not db_url:
        print("❌ Variabile SUPABASE_DB_URL mancante in .env.db")
        sys.exit(1)

    return db_url


SQL = r"""
---------------------------
-- 1) Estensioni utili
---------------------------
create extension if not exists pgcrypto;  -- per gen_random_uuid()

---------------------------
-- 2) Tabelle di dominio
---------------------------

-- Notizie veloci (link esterni o brevi testi)
create table if not exists public.news (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  summary       text,
  body          text,
  source        text,
  source_url    text,
  lang          text check (char_length(lang) between 2 and 5) default 'it',
  image_url     text,
  published_at  timestamptz default now(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Articoli lunghi (contenuto editoriale)
create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  title         text not null,
  excerpt       text,
  body_md       text,           -- contenuto markdown
  lang          text check (char_length(lang) between 2 and 5) default 'it',
  image_url     text,
  published_at  timestamptz default now(),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Documenti scaricabili (PDF ecc.)
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  file_path     text not null,  -- es: documents/xxx.pdf (Storage)
  lang          text check (char_length(lang) between 2 and 5) default 'it',
  created_at    timestamptz default now()
);

-- Tracking download
create table if not exists public.downloads (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid,           -- opzionale, se vuoi legarlo a auth.users
  ip           inet,           -- opzionale
  created_at   timestamptz default now()
);

---------------------------
-- 3) Abilita RLS
---------------------------
alter table public.news       enable row level security;
alter table public.articles   enable row level security;
alter table public.documents  enable row level security;
alter table public.downloads  enable row level security;

---------------------------
-- 4) Policy tabelle
---------------------------

-- Lettura pubblica news/articoli/documenti
drop policy if exists "public select news" on public.news;
create policy "public select news"
on public.news for select
to anon, authenticated
using (true);

drop policy if exists "public select articles" on public.articles;
create policy "public select articles"
on public.articles for select
to anon, authenticated
using (true);

drop policy if exists "public select documents" on public.documents;
create policy "public select documents"
on public.documents for select
to anon, authenticated
using (true);

-- Scrittura riservata ad utenti autenticati (base; puoi raffinare in seguito)
drop policy if exists "auth insert news" on public.news;
create policy "auth insert news"
on public.news for insert
to authenticated
with check (true);

drop policy if exists "auth insert articles" on public.articles;
create policy "auth insert articles"
on public.articles for insert
to authenticated
with check (true);

drop policy if exists "auth insert documents" on public.documents;
create policy "auth insert documents"
on public.documents for insert
to authenticated
with check (true);

-- Tracking download: inserimento consentito a tutti (anche anon)
drop policy if exists "log downloads" on public.downloads;
create policy "log downloads"
on public.downloads for insert
to anon, authenticated
with check (true);

-- Lettura download solo autenticati (opzionale)
drop policy if exists "read downloads auth" on public.downloads;
create policy "read downloads auth"
on public.downloads for select
to authenticated
using (true);

---------------------------
-- 5) Storage: buckets + policy
---------------------------

-- Crea bucket 'images' se non esiste
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'images'
  ) then
    perform storage.create_bucket(
      id => 'images',
      name => 'images',
      public => true
    );
  end if;
end$$;

-- Crea bucket 'documents' se non esiste (privato)
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'documents'
  ) then
    perform storage.create_bucket(
      id => 'documents',
      name => 'documents',
      public => false
    );
  end if;
end$$;

-- Policy su storage.objects: lettura pubblica per 'images'
drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'images');

-- Scrittura immagini solo autenticati
drop policy if exists "Auth write images" on storage.objects;
create policy "Auth write images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');

-- Documenti: lettura solo autenticati
drop policy if exists "Auth read documents" on storage.objects;
create policy "Auth read documents"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

-- Scrittura documenti solo autenticati
drop policy if exists "Auth write documents" on storage.objects;
create policy "Auth write documents"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents');
"""

def main():
    db_url = load_db_url()
    print("🔧 Applico schema su Supabase…")
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(SQL)
        print("✅ Schema creato/aggiornato con successo.")
        print("   Tabelle: news, articles, documents, downloads")
        print("   Buckets: images (pubblico), documents (privato)")
        print("   RLS: abilitato + policy base (public read / auth write)")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
