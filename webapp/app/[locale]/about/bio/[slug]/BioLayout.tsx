// app/[locale]/about/bio/[slug]/BioLayout.tsx
'use client';

import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

interface BioLayoutProps {
  locale: string;
  profile: { nameKey: string; image: string };
}

export default async function BioLayout({ locale, profile }: BioLayoutProps) {
  const t = await getTranslations('BioPage');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout a due colonne */}
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* COLONNA SINISTRA (15-20%) - NOME VERTICALE */}
        <div className="lg:w-1/5 xl:w-1/6 bg-gradient-to-b from-blue-50 to-blue-100 p-6 lg:p-8 flex items-center justify-center lg:justify-start">
          <div className="lg:-rotate-90 lg:transform lg:origin-center lg:whitespace-nowrap">
            <h1 className="text-3xl lg:text-4xl font-bold text-blue-900 tracking-tight">
              {t(`${profile.nameKey}.name`)}
            </h1>
          </div>
        </div>

        {/* COLONNA DESTRA (80-85%) - CONTENUTO BIO */}
        <div className="lg:w-4/5 xl:w-5/6 bg-white p-6 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            {/* Foto e nome orizzontale (solo mobile) */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 lg:hidden">
              <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src="https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/Logo/FotoAledoc.webp"
                  alt={t(`${profile.nameKey}.image_alt`)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 160px"
                  priority
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {t(`${profile.nameKey}.name`)}
                </h1>
                <h2 className="text-xl md:text-2xl text-blue-700 font-semibold">
                  {t(`${profile.nameKey}.role`)}
                </h2>
              </div>
            </div>

            {/* Per desktop: solo foto */}
            <div className="hidden lg:block mb-8">
              <div className="w-64 h-64 relative rounded-xl overflow-hidden shadow-xl">
                <Image
                  src={profile.image}
                  alt={t(`${profile.nameKey}.image_alt`)}
                  fill
                  className="object-cover"
                  sizes="256px"
                  priority
                />
              </div>
            </div>

            {/* Testo biografico */}
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p className="text-lg">{t(`${profile.nameKey}.intro`)}</p>
              <p>{t(`${profile.nameKey}.founder_description`)}</p>
              <p>{t(`${profile.nameKey}.mission`)}</p>
            </div>

            {/* Link per tornare alla pagina Team */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <a
                href={`/${locale}/about`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                ← {t('back_to_team')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}