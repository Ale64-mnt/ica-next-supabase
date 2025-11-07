import { getTranslations } from 'next-intl/server';
import { ContactForm } from './components/ContactForm';
import { ContactInfo } from './components/ContactInfo';

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Contact');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <ContactInfo locale={params.locale} />
          <ContactForm locale={params.locale} />
        </div>
      </div>
    </div>
  );
}
