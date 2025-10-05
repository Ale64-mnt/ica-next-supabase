'use client'; 
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Menu, X } from 'lucide-react'; 
import { LocaleSwitcher } from './LocaleSwitcher'; 

export function Header({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', labelKey: 'home_link' },
    { href: '/articles', labelKey: 'articles' },
    { href: '/news', labelKey: 'news' },
    { href: '/blog', labelKey: 'blog_link' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 shadow-md backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link href={`/${locale}`} className="flex items-center space-x-3">
            <Image
              src="/logo-small.png" // ✅ CORRETTO: Adesso cerca il file JPG
              alt={t('site_logo_alt')}
              // Dobbiamo specificare la dimensione per il logo JPEG
              width={140} 
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
                EduEthica {/* Rimosso sr-only per visibilità */}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6" 
               aria-label={t('main_navigation_label')}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`/${locale}${link.href}`}
                className="text-gray-700 hover:text-indigo-600 transition-colors 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <LocaleSwitcher />
          </nav>

          <div className="md:hidden flex items-center space-x-3">
            <LocaleSwitcher />
            <button
              aria-label={t('menu_toggle')}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <nav className="md:hidden bg-white/95 border-t border-gray-200" 
             aria-label={t('mobile_navigation_label')}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`/${locale}${link.href}`} 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
