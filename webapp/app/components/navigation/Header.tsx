'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';
// TODO: Avremo bisogno di un componente/icona per il menu mobile (es. MenuIcon)

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');

  const navLinks = [
    { href: '/', labelKey: 'home_link' },
    { href: '/articles', labelKey: 'articles' },
    { href: '/news', labelKey: 'news' },
    { href: '/blog', labelKey: 'blog_link' },
    { href: '/support', labelKey: 'support' },
    { href: '/contact', labelKey: 'contact' },
  ];

  return (
    // HEADER: Sticky, top-0, z-40, white background, border-b (Tailwind)
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW CONTAINER: Flex, centered, space-between */}
        <div className="flex items-center justify-between">
          
          {/* LOGO: Always visible */}
          <div className="flex items-center flex-shrink-0">
            <Link href={`/${locale}`}>
              <Image
                src="/logo.png"
                alt={t('site_logo_alt')}
                width={156}
                height={78}
                className="h-16 w-auto" // Aggiungi classi per controllo dimensione
              />
            </Link>
          </div>

          {/* MENU DESKTOP: VISIBILE DA MD IN SU (md:flex) */}
          <nav 
            className="hidden md:flex items-center space-x-8 mr-8" 
            aria-label={t('main_navigation_label')}
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`/${locale}${link.href}`}
                className="text-sm font-bold text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* UTILITY (Locale Switcher & Mobile Menu Button) */}
          <div className="flex items-center flex-shrink-0">
            {/* LocaleSwitcher */}
            <div className="mr-4">
              <LocaleSwitcher />
            </div>

            {/* MOBILE MENU BUTTON: VISIBILE SOLO SU MOBILE (md:hidden) */}
            <button 
              type="button" 
              className="md:hidden p-2 text-gray-700 hover:text-gray-900"
              aria-label={t('open_menu')}
              // TODO: Aggiungere logica per aprire/chiudere il menu mobile (stato React)
            >
              {/* Sostituire con icona "hamburger" */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* TODO: Qui andrà il menu mobile che si apre sotto (MobileHeader o logica inline) */}
    </header>
  );
}