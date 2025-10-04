'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation'
import { useState } from 'react';

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const nav = [
    { href: `/${locale}`, label: t('home_link'), current: pathname === `/${locale}` },
    { href: `/${locale}/blog`, label: t('blog_link'), current: pathname === `/${locale}/blog` },
    { href: `/${locale}/news`, label: t('news'), current: pathname?.startsWith(`/${locale}/news`) },
    { href: `/${locale}/articles`, label: t('articles'), current: pathname?.startsWith(`/${locale}/articles`) },
    { href: `/${locale}/about`, label: t('about'), current: pathname === `/${locale}/about` },
    { href: `/${locale}/contact`, label: t('contact'), current: pathname === `/${locale}/contact` },
  ]

  return (
    <header role="banner">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link 
          href={`/${locale}`} 
          className="font-semibold text-lg text-gray-900 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          aria-label={`${t('site_title')} - ${t('home_link')}`}
        >
          {t('site_title')}
        </Link>
        
        <nav 
          aria-label={t('main_navigation_label')} 
          className="hidden md:flex gap-6 text-sm"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.current ? 'page' : undefined}
              className={`
                font-medium transition-colors duration-200
                ${item.current 
                  ? 'text-blue-700 underline underline-offset-4 font-semibold' 
                  : 'text-gray-700 hover:text-blue-600'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={t('menu_toggle')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav 
          id="mobile-navigation"
          aria-label={t('main_navigation_label')}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-3 space-y-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={`
                  block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                  ${item.current 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}