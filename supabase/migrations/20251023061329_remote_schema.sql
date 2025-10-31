

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text",
    "title" "text" NOT NULL,
    "excerpt" "text",
    "body_md" "text",
    "lang" "text" DEFAULT 'it'::"text",
    "image_url" "text",
    "published_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "content" "text",
    "cover_url" "text",
    "published" boolean DEFAULT true NOT NULL,
    "locale" "text" DEFAULT 'it'::"text" NOT NULL,
    "summary" "text",
    "category" "text",
    CONSTRAINT "articles_lang_check" CHECK ((("char_length"("lang") >= 2) AND ("char_length"("lang") <= 5)))
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blog_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "excerpt" "text",
    "body_md" "text",
    "image_url" "text",
    "related_article_id" "uuid",
    "image_alt" "text",
    "locale" "text"
);


ALTER TABLE "public"."blog_posts" OWNER TO "postgres";


ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");



CREATE INDEX "articles_category_locale" ON "public"."articles" USING "btree" ("category", "locale");



CREATE INDEX "articles_published_at_desc" ON "public"."articles" USING "btree" ("published_at" DESC);



CREATE INDEX "blog_posts_slug_idx" ON "public"."blog_posts" USING "btree" ("slug");



CREATE INDEX "idx_articles_category" ON "public"."articles" USING "btree" ("category");



CREATE INDEX "idx_articles_locale" ON "public"."articles" USING "btree" ("locale");



CREATE INDEX "idx_articles_published_at" ON "public"."articles" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_articles_published_at_desc" ON "public"."articles" USING "btree" ("published_at" DESC);



CREATE UNIQUE INDEX "ux_articles_locale_slug" ON "public"."articles" USING "btree" ("locale", "slug");



CREATE UNIQUE INDEX "ux_articles_slug_locale" ON "public"."articles" USING "btree" ("slug", "locale");



ALTER TABLE ONLY "public"."blog_posts"
    ADD CONSTRAINT "blog_posts_related_article_id_fkey" FOREIGN KEY ("related_article_id") REFERENCES "public"."articles"("id") ON DELETE SET NULL;



CREATE POLICY "Authenticated users can create blog posts." ON "public"."blog_posts" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Public blog posts are viewable by everyone." ON "public"."blog_posts" FOR SELECT USING (true);



CREATE POLICY "public_read_articles" ON "public"."articles" FOR SELECT TO "anon" USING (true);



CREATE POLICY "read_published_by_locale" ON "public"."articles" FOR SELECT TO "anon" USING ((("published" = true) AND ("locale" = ANY (ARRAY['it'::"text", 'en'::"text"]))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON TABLE "public"."blog_posts" TO "anon";
GRANT ALL ON TABLE "public"."blog_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."blog_posts" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

  create policy "Auth read documents"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'documents'::text));



  create policy "Auth write documents"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'documents'::text));



  create policy "Auth write images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'images'::text));



  create policy "Authenticated insert documents"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'documents'::text));



  create policy "Authenticated insert images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'images'::text));



  create policy "Authenticated read documents"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'documents'::text));



  create policy "Owner delete documents"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'documents'::text) AND (owner = auth.uid())));



  create policy "Owner delete images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'images'::text) AND (owner = auth.uid())));



  create policy "Owner update documents"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'documents'::text) AND (owner = auth.uid())))
with check (((bucket_id = 'documents'::text) AND (owner = auth.uid())));



  create policy "Owner update images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'images'::text) AND (owner = auth.uid())))
with check (((bucket_id = 'images'::text) AND (owner = auth.uid())));



  create policy "Public read images"
  on "storage"."objects"
  as permissive
  for select
  to anon, authenticated
using ((bucket_id = 'images'::text));



  create policy "images_public_read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'images'::text));



  create policy "images_public_upload"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'images'::text));



