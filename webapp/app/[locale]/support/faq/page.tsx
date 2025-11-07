import { getTranslations } from 'next-intl/server';

export default async function FAQPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('faq_title')}</h1>
      <p>Domande frequenti - in sviluppo</p>
    </div>
  );
}
