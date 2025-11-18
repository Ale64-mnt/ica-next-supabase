// app/components/navigation/DesktopHeader.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LocaleSwitcher } from './LocaleSwitcher.client';

type DesktopHeaderProps = { 
  locale: string;
  translations: {
    site_logo_alt: string;
    main_navigation_label: string;
    home_link: string;
    about: string;
    financial_education: string; // 🔥 NUOVA VOCE
    articles: string;
    news: string;
    blog_link: string;
    support: string;
    contact: string;
  };
};

export function DesktopHeader({ locale, translations }: DesktopHeaderProps) {
  const navLinks = [
    { href: '/', label: translations.home_link },
    { href: '/about', label: translations.about },
    { href: '/education', label: translations.financial_education }, // 🔥 NUOVA VOCE
    { href: '/articles', label: translations.articles },
    { href: '/news', label: translations.news },
    { href: '/blog', label: translations.blog_link },
    { href: '/support', label: translations.support },
    { href: '/contact', label: translations.contact },
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
      <div style={{ maxWidth: 'none', width: '100%', padding: '0 1rem' }}>
        <div className="flex items-center justify-between">

          {/* LOGO - SINISTRA */}
          <div className="flex items-center flex-shrink-0">
            <Link href={`/${locale}`}>
              <Image
                src="/logo.webp"
                alt={translations.site_logo_alt}
                width={156}
                height={156}
                className="h-40 w-auto"
                priority
              />
            </Link>
          </div>

          {/* NAVIGAZIONE - CENTRO */}
          <nav
            className="hidden md:flex items-center gap-[40px] mx-[60px]"
            aria-label={translations.main_navigation_label}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className="text-[15px] font-semibold text-gray-700 no-underline hover:text-gray-900 hover:underline underline-offset-4 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* MENU LINGUE - DESTRA */}
          <div className="hidden md:flex items-center flex-shrink-0 mr-[60px]">
            <LocaleSwitcher />
          </div>

        </div>
      </div>
    </header>
  );
}