import { getTranslations } from 'next-intl/server';
import { DesktopHeader } from './DesktopHeader';
import { MobileHeader } from './MobileHeader';

type HeaderProps = { locale: string };

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations('Navigation');

  const translations = {
    site_logo_alt: t('site_logo_alt'),
    main_navigation_label: t('main_navigation_label'),
    open_menu: t('open_menu'),
    close_menu: t('close_menu'),
    home_link: t('home_link'),
    about: t('about'),
    financial_education: t('financial_education'),
    articles: t('articles'),
    news: t('news'),
    blog_link: t('blog_link'),
    support: t('support'),
    contact: t('contact'),
  };

  return (
    <>
      {/* Header desktop: SOLO da lg in su */}
      <div className="hidden lg:block">
        <DesktopHeader locale={locale} translations={translations} />
      </div>

      {/* Header mobile/tablet: fino a lg */}
      <div className="block lg:hidden">
        <MobileHeader locale={locale} translations={translations} />
      </div>
    </>
  );
}
