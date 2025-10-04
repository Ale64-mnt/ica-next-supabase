"use client";

import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface SiteHeaderProps {
  locale: string;
}

export default function SiteHeader({ locale }: SiteHeaderProps) {
  const t = useTranslations('Navigation');

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/blog`, label: t('blog_link') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/articles`, label: t('articles') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            href={`/${locale}`} 
            className="text-xl font-bold text-gray-900"
          >
            {t('site_title')}
          </Link>
          
          <nav className="flex space-x-6" aria-label={t('main_navigation_label')}>
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}