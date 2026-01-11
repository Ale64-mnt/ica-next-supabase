// app/[locale]/contact/page.tsx
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import BrevoContactForm from '@/components/BrevoContactForm';

export function generateStaticParams() {
  return [
    { locale: 'it' },
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'es' },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title:
      locale === 'it'
        ? 'Contatti'
        : locale === 'fr'
        ? 'Contact'
        : locale === 'de'
        ? 'Kontakt'
        : locale === 'es'
        ? 'Contacto'
        : 'Contact',
    description:
      locale === 'it'
        ? 'Parla con il nostro team.'
        : locale === 'fr'
        ? 'Parlez à notre équipe.'
        : locale === 'de'
        ? 'Sprechen Sie mit unserem Team.'
        : locale === 'es'
        ? 'Habla con nuestro equipo.'
        : 'Talk to our team.',
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Contact');

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* COLONNA SX */}
          <aside className="min-w-0">
            <div className="flex flex-col gap-8">
              {/* Immagine */}
              <div className="w-full flex justify-center lg:justify-start">
                <div className="w-full max-w-sm sm:max-w-md">
                  <Image
                    src="https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/icon/Info_conctat.webp"
                    alt={t('info_image_alt')}
                    width={720}
                    height={520}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Box info (titolo + elenco: +1 misura e grassetto) */}
              <div className="w-full flex justify-center lg:justify-start">
                <div className="w-full max-w-xl rounded-2xl bg-gradient-to-r from-blue-50 to-slate-50 shadow-sm ring-1 ring-black/5 border-l-[10px] border-blue-700 p-7 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 leading-tight">
                    {t('left_title')}
                  </h2>

                  <ul className="mt-5 list-disc pl-6 space-y-3 text-base sm:text-lg font-semibold text-slate-800 leading-relaxed marker:text-blue-700">
                    <li>{t('left_bullet_1')}</li>
                    <li>{t('left_bullet_2')}</li>
                    <li>{t('left_bullet_3')}</li>
                    <li>{t('left_bullet_4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* COLONNA DX */}
          <section className="min-w-0">
            <div className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <div className="p-6 sm:p-8">
                <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {t('right_title')}
                </h1>
                <p className="mt-2 text-center text-sm sm:text-base text-slate-600">
                  {t('right_subtitle')}
                </p>
              </div>

              <div className="px-6 sm:px-8 pb-8">
                <BrevoContactForm />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
