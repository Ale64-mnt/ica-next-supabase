// app/[locale]/education/page.tsx
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import BrevoFormEnhanced from './components/BrevoFormEnhanced';

export default async function EducationPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const t = await getTranslations('EducationPage');
  const tCommon = await getTranslations('Common');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Sezione Modulo Brevo */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 md:p-8">
          <div className="w-16 h-16 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">📚</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 text-center">
            {t('coming_soon_title')}
          </h2>
          
          <p className="text-lg text-blue-800 mb-6 leading-relaxed text-center">
            {t('coming_soon_message')}
          </p>
          
          {/* Modulo Brevo */}
          <div className="mt-6">
            <p className="text-blue-700 font-medium mb-4 text-center">
              {t('waitlist_title')}
            </p>
            
            <BrevoFormEnhanced />
            
           
          </div>
        </div>
      </div>

      {/* Spiegazione progetto */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🇪🇺</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              {t('eu_aligned')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('eu_aligned_desc')}
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              {t('all_ages')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('all_ages_desc')}
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">
              {t('interactive')}
            </h3>
            <p className="text-gray-600 text-sm">
              {t('interactive_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Link per tornare indietro */}
      <div className="text-center mt-12">
        <Link 
          href={`/${params.locale}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <span>← {t('back_to_home') || tCommon('back_to_home')}</span>
        </Link>
      </div>
    </div>
  );
}