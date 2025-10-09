'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';

// ⚠️ CORREGGI: export function DesktopHeader invece di Header
export function DesktopHeader({ locale }: { locale: string }) {
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
    // ⚠️ AGGIUNGI: hidden lg:block e usa classi Tailwind
    <header className="hidden lg:block sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link href={`/${locale}`} className="flex items-center">
              <Image
                src="/logo.png"
                alt={t('site_logo_alt')}
                width={156}
                height={78}
                className="h-16 w-auto" // Usa classi Tailwind
              />
            </Link>
          </div>

          {/* MENU DESKTOP */}
          <nav className="flex items-center gap-8 mx-8" aria-label={t('main_navigation_label')}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`/${locale}${link.href}`}
                className="text-gray-700 hover:text-indigo-600 font-medium text-sm whitespace-nowrap transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* LOCALESWITCHER */}
          <div className="flex-shrink-0">
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}