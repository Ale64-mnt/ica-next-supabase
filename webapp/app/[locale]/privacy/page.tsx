// webapp/app/[locale]/privacy/page.tsx
import { useTranslations } from 'next-intl';

export default function PrivacyPolicyPage() {
  const t = useTranslations('Privacy'); 

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">{t('title')}</h1>
      
      {/* Classe .content richiesta per stili di accessibilità */}
      <div className="content space-y-6 text-gray-700 leading-relaxed">
        
        <p className="text-lg italic">{t('last_updated')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_1_title')}</h2>
        <p>{t('section_1_text_p1')}</p>
        <p>{t('section_1_text_p2')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_2_title')}</h2>
        <p>{t('section_2_text')}</p>
        <ul className="list-disc ml-6">
          <li>{t('data_point_1')}</li>
          <li>{t('data_point_2')}</li>
          <li>{t('data_point_3')}</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('section_3_title')}</h2>
        <p>{t('section_3_text')}</p>
      </div>
    </div>
  );
}