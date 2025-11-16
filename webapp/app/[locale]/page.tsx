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

  // Mappa colori categorie (stessa di BlogCard e altre pagine)
  const categoryColors: Record<string, string> = {
    'financial-education-eu': 'bg-blue-100 text-blue-800 border-blue-200',
    'cybersecurity-frauds': 'bg-red-100 text-red-800 border-red-200',
    'digital-ethics': 'bg-purple-100 text-purple-800 border-purple-200',
    'eu-updates': 'bg-green-100 text-green-800 border-green-200',
    'company-news': 'bg-orange-100 text-orange-800 border-orange-200',
    'practical-guides': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'multilingual-education': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  return (
    <div className="min-h-screen">
      {/* HERO AGGIORNATO */}
      <section id="hero" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-stretch gap-8 md:gap-12 lg:gap-16 w-full">
            
            {/* Colonna testo */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t('hero_title')}
              </h1>

              <div className="mt-4 max-w-xl space-y-4">
                <p className="text-base sm:text-lg text-slate-600">
                  {t('hero_subtitle')}
                </p>

                {/* Citazione in corsivo */}
                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <p className="italic text-sm sm:text-base text-slate-700 leading-relaxed">
                  {t('hero_quote')}
                  </p>
                  <p className="text-sm sm:text-base text-slate-700 mt-2">
                    {t('hero_quote_continuation')}
                  </p>
                </div>

                {/* Link alla strategia UE */}
                <div className="pt-2">
                  <a 
                    href="https://finance.ec.europa.eu/consumer-finance-and-payments/financial-literacy_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium text-sm sm:text-base transition-colors"
                  >
                    <span>🔗</span>
                    {t('eu_strategy_link')}
                  </a>
                </div>
              </div>

              {/* BOTTONI RIMOSSI */}
            </div>

            {/* Colonna immagine */}
            <div className="flex-1 min-w-0">
              <div className="w-full rounded-2xl bg-[#eef3f8] p-4 sm:p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <div className="relative w-full max-w-[640px] h-56 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem]">
                  <Image
                    src="/images/homepage-hero.png"
                    alt={t('hero_image_alt')}
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

      {/* NEWS SECTION - RESTA INVARIATA */}
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
                
                // Ottieni stile categoria e traduzione
                const categoryStyle = categoryColors[news.category] || 'bg-gray-100 text-gray-800 border-gray-200';
                const categoryLabel = newsT.raw('categories')[news.category] || news.category;

                return (
                  <article
                    key={news.id}
                    className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden"
                  >
                    <Link
                      href={`/${locale}/news/${news.slug}`}
                      className="flex flex-col md:flex-row gap-6 min-w-0 hover:bg-slate-50 transition"
                    >
                      {/* Thumbnail - ASPECT 16:9 (video) */}
<div className="relative w-full md:w-[260px] lg:w-[300px] h-auto aspect-video shrink-0 bg-slate-100 overflow-hidden">
  {imgSrc ? (
    <div className="w-full h-full relative">
      <Image
        src={news.thumb_url || news.image_url}
        alt={imgAlt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 260px, 300px"
        className="object-cover"
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
                        {/* CATEGORIA - SOPRA LA DATA */}
                        {news.category && (
                          <div className="mb-2">
                            <span className={`inline-block ${categoryStyle} text-xs font-medium px-3 py-1 rounded-full border`}>
                              {categoryLabel}
                            </span>
                          </div>
                        )}

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