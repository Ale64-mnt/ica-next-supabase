import type { MetadataRoute } from 'next';

type NewsRow = { slug: string; lang: string };
const LOCALES = ['it','en'] as const;

async function fetchNews(): Promise<NewsRow[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!base || !anon) return [];
  const url = `${base}/rest/v1/news?select=slug,lang`;
  const r = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, next: { revalidate: 60 }});
  if (!r.ok) return [];
  return r.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  const now = new Date();
  const baseEntries: MetadataRoute.Sitemap = LOCALES.map(l => ({
    url: `${site}/${l}`, lastModified: now, changeFrequency: 'daily', priority: 0.8
  }));

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap(l => [
    { url: `${site}/${l}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site}/${l}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]);

  const news = await fetchNews();
  const newsEntries: MetadataRoute.Sitemap = news.map(n => ({
    url: `${site}/${n.lang}/news/${encodeURIComponent(n.slug)}`,
    lastModified: now, changeFrequency: 'weekly', priority: 0.6
  }));

  return [...baseEntries, ...staticEntries, ...newsEntries];
}
