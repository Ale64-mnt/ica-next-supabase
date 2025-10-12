import { getTranslations } from 'next-intl/server';

interface SiteFooterProps {
  locale: string;
}

export default async function SiteFooter({ locale }: SiteFooterProps) {
  const t = await getTranslations('Footer');

  return (
    <footer className="bg-gray-100 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">{t('copyright', { year: new Date().getFullYear() })}</p>
        <p className="text-gray-500 text-sm mt-2">{t('all_rights_reserved')}</p>
      </div>
    </footer>
  );
}
