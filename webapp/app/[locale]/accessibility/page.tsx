// webapp/app/[locale]/accessibility/page.tsx
import { useTranslations } from 'next-intl';

export default function AccessibilityStatementPage() {
  const t = useTranslations('Accessibility'); 

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">{t('title')}</h1>
      
      {/* Classe .content richiesta per stili di accessibilità */}
      <div className="content space-y-6 text-gray-700 leading-relaxed">
        
        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('commitment_title')}</h2>
        <p>{t('commitment_text')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('standard_title')}</h2>
        <p>{t('standard_text')}</p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800">{t('feedback_title')}</h2>
        <p>{t('feedback_text')}</p>
        <p>
          {t('contact_intro')}{' '}
          <a href="/contact" className="text-blue-600 hover:underline">{t('contact_link_text')}</a>
          {t('contact_outro')}
        </p>
      </div>
    </div>
  );
}