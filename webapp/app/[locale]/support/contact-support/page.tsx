import { getTranslations } from 'next-intl/server';

export default async function ContactSupportPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Support');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('contact_support_title')}</h1>
      <p>Contatta il supporto - in sviluppo</p>
    </div>
  );
}
