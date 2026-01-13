// app/components/navigation/Header.tsx
import { getTranslations } from 'next-intl/server';
import { DesktopHeader } from './DesktopHeader';
import { MobileHeader } from './MobileHeader';

type HeaderProps = { locale: string };

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations('Navigation');

  // 🔥 DEFINIAMO ESPLICITAMENTE TUTTE LE TRADUZIONI RICHIESTE
  const translations = {
    site_logo_alt: t('site_logo_alt'),
    main_navigation_label: t('main_navigation_label'),
    open_menu: t('open_menu'),
    close_menu: t('close_menu'),
    
    // 🔥 QUESTE SONO OBBLIGATORIE per DesktopHeader e MobileHeader
    home_link: t('home_link'),
    about: t('about'),
    financial_education: t('financial_education'),
    news: t('news'),
    blog_link: t('blog_link'),
    contact: t('contact'),
    
    // ❌ Non includiamo più 'articles' e 'support' 
    // (ma le traduzioni esistono ancora nei file JSON)
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