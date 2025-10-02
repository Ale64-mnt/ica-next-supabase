// webapp/app/[locale]/terms/page.tsx
import { useTranslations } from 'next-intl';

export default function TermsOfServicePage() {
  const t = useTranslations('Terms'); 

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">{t('title')}</h1>
      
      {/* Classe .content richiesta per stili di accessibilità */}
      <div className="content space-y-6 text-gray-700 leading-relaxed">
        
        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_1_title')}</h2>
        <p>{t('section_1_text')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_2_title')}</h2>
        <p>{t('section_2_text')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_3_title')}</h2>
        <p>{t('section_3_text')}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-2 text-gray-800">{t('sub_section_a_title')}</h3>
        <p>{t('sub_section_a_text')}</p>
        
        <h3 className="text-xl font-medium mt-6 mb-2 text-gray-800">{t('sub_section_b_title')}</h3>
        <p>{t('sub_section_b_text')}</p>

      </div>
    </div>
  );
}