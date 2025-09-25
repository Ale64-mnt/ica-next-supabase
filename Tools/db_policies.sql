-- Abilita RLS
alter table articles enable row level security;

-- Policy lettura: solo published=true e locale tra it/en
drop policy if exists "read_published_by_locale" on articles;
create policy "read_published_by_locale" on articles
for select
to anon
using (
  published = true
  and (locale in ('it','en'))
);

-- Nessuna scrittura per anon
revoke insert, update, delete on articles from anon;

-- Indici utili
create unique index if not exists articles_slug_key on articles(slug);
create index if not exists articles_published_at_desc on articles(published_at desc);
create index if not exists articles_category_locale on articles(category, locale);
