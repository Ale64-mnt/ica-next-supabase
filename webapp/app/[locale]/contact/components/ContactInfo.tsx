import { useTranslations } from 'next-intl';

export function ContactInfo({ locale }: { locale: string }) {
  const t = useTranslations('Contact');
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{t('info_title')}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">{t('address_title')}</h3>
          <p className="text-gray-600">{t('address')}</p>
        </div>
        <div>
          <h3 className="font-semibold">{t('email_title')}</h3>
          <p className="text-gray-600">info@icafinanza.it</p>
        </div>
        <div>
          <h3 className="font-semibold">{t('phone_title')}</h3>
          <p className="text-gray-600">+39 02 1234567</p>
        </div>
      </div>
    </div>
  );
}
