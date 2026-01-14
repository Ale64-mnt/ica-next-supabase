import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link'; // Aggiungi questo import

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
                {/* MODIFICA QUI: Rendi il nome cliccabile */}
                <Link 
                  href={`/${locale}/about/bio/alessandro-mantovani`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 hover:text-blue-600">
                    {t('founders.Alessandro.name')}
                  </h3>
                </Link>
                <p className="text-blue-600 font-medium mb-3">{t('founders.Alessandro.role')}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('founders.Alessandro.bio')}</p>
                
                {/* Aggiungi un link esplicito sotto la bio */}
                <div className="mt-4">
                  <Link 
                    href={`/${locale}/about/bio/alessandro-mantovani`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <span>Leggi la biografia completa</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
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