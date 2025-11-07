import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export function TeamSection({ locale }: { locale: string }) {
  const t = useTranslations('About.team');

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Team Photo - Responsive e centrata */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src="https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/page/Mantovani%20Brothers-Mountains-small.png"
                alt="Il nostro team"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
              />
            </div>
          </div>
          
          {/* Team Description */}
          <div className="text-center">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              {t('team_description')}
            </p>
            
            {/* Founders List - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
              <div className="text-center bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('founders.Alessandro.name')}</h3>
                <p className="text-blue-600 font-medium mb-3">{t('founders.Alessandro.role')}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{t('founders.Alessandro.bio')}</p>
              </div>
              
              <div className="text-center bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t('founders.Egle.name')}</h3>
                <p className="text-blue-600 font-medium mb-3">{t('founders.Egle.role')}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{t('founders.Egle.bio')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}