// webapp/app/[locale]/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { getLatestNews } from '@/app/lib/supabase/news-queries';

type PageProps = { params: { locale: string } };

export default async function Page({ params }: PageProps) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations('Index');
  const newsT = await getTranslations('News');
  const latestNews = await getLatestNews(locale, 3);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section id="hero" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-stretch gap-8 md:gap-12 lg:gap-16 w-full">
            
            {/* Colonna testo */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t('hero_title')}
              </h1>

              <p className="mt-4 max-w-xl text-base sm:text-lg text-slate-600">
                {t('hero_subtitle')}
              </p>

              {/* BOTTONI RIMOSSI */}
            </div>

            {/* Colonna immagine */}
            <div className="flex-1 min-w-0">
              <div className="w-full rounded-2xl bg-[#eef3f8] p-4 sm:p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <div className="relative w-full max-w-[640px] h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem]">
                  <Image
                    src="/images/homepage-hero.png"
                    alt={t('hero_image_alt') || 'Educazione finanziaria e digitale etica e inclusiva'}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">
            {newsT('eu_updates')}
          </h2>

          <div className="flex flex-col gap-6 md:gap-8">
            {latestNews?.length ? (
              latestNews.map((news: any) => {
                const date = news?.published_at
                  ? new Date(news.published_at).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '';

                const imgSrc: string | null = news?.thumb_url || news?.image_url || null;
                const imgAlt: string = news?.image_alt || news?.title || 'news image';

                return (
                  <article
                    key={news.id}
                    className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden"
                  >
                    <Link
                      href={`/${locale}/news/${news.slug}`}
                      className="flex flex-col md:flex-row gap-6 min-w-0 hover:bg-slate-50 transition"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full md:w-[260px] lg:w-[300px] h-48 md:h-[170px] shrink-0 bg-slate-100 overflow-hidden">
                        {imgSrc ? (
                          <div className="w-full h-full relative">
                            <Image
                              src={imgSrc}
                              alt={imgAlt}
                              fill
                              sizes="(max-width: 768px) 100vw, 300px"
                              className="object-cover"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm bg-slate-100">
                            📷
                          </div>
                        )}
                      </div>

                      {/* Contenuto testo */}
                      <div className="flex-1 basis-0 min-w-0 p-4 md:p-5">
                        {date && (
                          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            {date}
                          </div>
                        )}

                        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                          {news.title}
                        </h3>

                        {news?.excerpt && (
                          <p className="text-sm md:text-base text-slate-600 mb-3 line-clamp-3">
                            {news.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-auto">
                          {news?.locale && (
                            <span className="inline-block rounded-full bg-slate-100 text-slate-600 text-xs px-3 py-1">
                              {String(news.locale).toUpperCase()}
                            </span>
                          )}
                          <span className="text-blue-700 font-medium">
                            {newsT('read_more')} →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <p className="text-slate-500">{newsT('no_news') || 'Nessuna news disponibile'}</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center justify-center rounded-md border-2 border-blue-700 px-5 py-3 text-blue-700 font-semibold hover:bg-blue-50 transition"
            >
              {newsT('view_all_news')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}