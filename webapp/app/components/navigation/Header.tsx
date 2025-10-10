'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { LocaleSwitcher } from './LocaleSwitcher';

type HeaderProps = { locale: string };

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('Navigation');

  const navLinks = [
    { href: '/', labelKey: 'home_link' },
    { href: '/articles', labelKey: 'articles' },
    { href: '/news', labelKey: 'news' },
    { href: '/blog', labelKey: 'blog_link' },
    { href: '/support', labelKey: 'support' },
    { href: '/contact', labelKey: 'contact' },
  ];

  // Evita doppio slash quando href === '/'
  const buildHref = (path: string) => (path === '/' ? `/${locale}` : `/${locale}${path}`);

  // Misura il LocaleSwitcher (dopo scala 1.5×) per dare la stessa dimensione all’hamburger
  const lsWrapperRef = useRef<HTMLDivElement | null>(null);
  const [lsSize, setLsSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = lsWrapperRef.current;
    if (!el) return;

    const setSize = () => {
      const rect = el.getBoundingClientRect(); // include la scale-150
      setLsSize({ width: Math.ceil(rect.width), height: Math.ceil(rect.height) });
    };

    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(el);
    window.addEventListener('resize', setSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LOGO (immutato) */}
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

          {/* MENU DESKTOP */}
          <nav
            className="hidden md:flex items-center space-x-8"
            aria-label={t('main_navigation_label')}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className="text-sm font-bold text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* UTILITY: spostato VISIVAMENTE di 2cm a sinistra (translate), gap 3mm, hamburger = stessa dimensione del menu lingue */}
          <div
            className="flex items-center flex-shrink-0 gap-[3mm] will-change-transform"
            style={{ transform: 'translateX(-2cm)' }}
          >
            {/* HAMBURGER (sinistra) */}
            <button
              type="button"
              className="md:hidden p-0 text-gray-700 hover:text-gray-900 flex items-center justify-center"
              aria-label={t('open_menu')}
              // TODO: stato React per aprire/chiudere il menu mobile
              style={{
                width: lsSize?.width ?? 48,
                height: lsSize?.height ?? 36,
              }}
            >
              <svg
                className="w-[70%] h-[70%]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* MENU LINGUE (destra) ingrandito 1.5× */}
            <div ref={lsWrapperRef} className="flex items-center transform scale-150 origin-left">
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* TODO: menu mobile a comparsa sotto l'header */}
    </header>
  );
}
