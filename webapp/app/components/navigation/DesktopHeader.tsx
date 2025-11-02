import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from './LocaleSwitcher';

type DesktopHeaderProps = { locale: string };

export async function DesktopHeader({ locale }: DesktopHeaderProps) {
  const t = await getTranslations('Navigation');

  const navLinks = [
    { href: '/', labelKey: 'home_link' },
    { href: '/articles', labelKey: 'articles' },
    { href: '/news', labelKey: 'news' },
    { href: '/blog', labelKey: 'blog_link' },
    { href: '/support', labelKey: 'support' },
    { href: '/contact', labelKey: 'contact' },
  ];

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  return (
    <header 
      className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-2"
      style={{ 
        width: '100vw', 
        maxWidth: '100%', 
        left: 0, 
        right: 0 
      }}
    >
      {/* ✅ FIX: Container senza max-width limitante */}
      <div style={{ maxWidth: 'none', width: '100%', padding: '0 1rem' }}>
        <div className="flex items-center justify-between">

          {/* LOGO - SINISTRA */}
          <div className="flex items-center flex-shrink-0">
            <Link href={`/${locale}`}>
              <Image
                src="/logo.png"
                alt={t('site_logo_alt')}
                width={156}
                height={78}
                className="h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* NAVIGAZIONE - CENTRO (nascosta su mobile) */}
          <nav
            className="hidden md:flex items-center gap-[40px] mx-[60px]"
            aria-label={t('main_navigation_label')}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className="text-[15px] font-semibold text-gray-700 no-underline hover:text-gray-900 hover:underline underline-offset-4 transition-all duration-200 [color:inherit] [text-decoration-color:inherit]"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* MENU LINGUE - DESTRA (nascosto su mobile) */}
          <div className="hidden md:flex items-center flex-shrink-0 mr-[60px]">
            <LocaleSwitcher currentLocale={locale} currentPath={`/${locale}`}  />
          </div>

          {/* ✅ HAMBURGER MENU per mobile (visibile solo su mobile) */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>
      </div>
    </header>
  );
}