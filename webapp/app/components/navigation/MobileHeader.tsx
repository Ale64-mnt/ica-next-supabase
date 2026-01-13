// app/components/navigation/MobileHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher.client';

type MobileHeaderProps = { 
  locale: string;
  translations: {
    site_logo_alt: string;
    main_navigation_label: string;
    open_menu: string;
    close_menu: string;
    // ✅ Tutte le traduzioni richieste da Header.tsx
    home_link: string;
    about: string;
    financial_education: string;
    news: string;
    blog_link: string;
    contact: string;
    // ❌ 'articles' e 'support' sono stati rimossi
  };
};

export function MobileHeader({ locale, translations }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔥 MODIFICA CHIAVE: Array dei link con SOLO le voci visibili
  const navLinks = [
    { href: '/', label: translations.home_link },
    { href: '/about', label: translations.about },
    { href: '/education', label: translations.financial_education },
    { href: '/news', label: translations.news },
    { href: '/blog', label: translations.blog_link },
    { href: '/contact', label: translations.contact },
    // ❌ "Articles" e "Support" sono stati rimossi
  ];

  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen);

  return (
    <>
      {/* HEADER FISSO */}
      <header 
        className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 py-2"
        style={{ 
          width: '100vw', 
          maxWidth: '100%', 
          left: 0, 
          right: 0 
        }}
      >
        <div style={{ maxWidth: 'none', width: '100%', padding: '0 1rem' }}>
          <div className="flex items-center justify-between">
            
            {/* LOGO */}
            <div className="flex items-center flex-shrink-0">
              <Link href={`/${locale}`} onClick={closeMenu}>
                <Image
                  src="/logo.webp"
                  alt={translations.site_logo_alt}
                  width={120}
                  height={60}
                  className="h-36 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* CONTROLLI DESTRA (LINGUA + HAMBURGER) */}
            <div className="flex items-center gap-2">
              
              {/* SWITCHER LINGUE CON MAPPAMONDO */}
              <div className="hidden sm:flex items-center">
                <LocaleSwitcher />
              </div>

              {/* ICONA LINGUA COMPATTA */}
              <div className="sm:hidden" ref={langDropdownRef}>
                <div className="relative">
                  <button 
                    className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={toggleLangMenu}
                    aria-label="Cambia lingua"
                    aria-expanded={isLangMenuOpen}
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                  
                  {/* Dropdown che si apre al click */}
                  {isLangMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <LocaleSwitcher />
                    </div>
                  )}
                </div>
              </div>

              {/* HAMBURGER BUTTON */}
              <button 
                className="p-2"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? translations.close_menu : translations.open_menu}
                aria-expanded={isMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* OVERLAY E MENU HAMBURGER */}
      {isMenuOpen && (
        <>
          {/* OVERLAY OSCURO */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
            style={{ marginTop: '64px' }}
          />
          
          {/* MENU A COMPARSA */}
          <div 
            className="fixed top-16 left-0 right-0 bg-white z-50 shadow-lg border-t border-gray-200"
            style={{ marginTop: '64px' }}
          >
            <nav 
              className="flex flex-col py-4"
              aria-label={translations.main_navigation_label}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={buildHref(link.href)}
                  className="px-6 py-3 text-lg font-semibold text-gray-700 no-underline hover:bg-gray-50 hover:text-gray-900 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}