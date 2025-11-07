import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ContactSuccessPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Contact');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold mb-4">{t('success_title')}</h1>
        <p className="text-gray-600 mb-8">{t('success_message')}</p>
        <Link 
          href={`/${params.locale}`}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
        >
          {t('success_back_home')}
        </Link>
      </div>
    </div>
  );
}
