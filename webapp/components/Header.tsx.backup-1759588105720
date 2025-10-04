"use client"; // AGGIUNGI QUESTA RIGA

import Link from 'next/link'
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation'

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations('Navigation');
  const pathname = usePathname()

  // Navigazione con traduzioni
  const nav = [
    { href: `/${locale}`, label: t('home_link') },
    { href: `/${locale}/blog`, label: t('blog_link') },
    { href: `/${locale}/news`, label: t('news') },
    { href: `/${locale}/articles`, label: t('articles') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/contact`, label: t('contact') },
  ]

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        {/* Logo con traduzione */}
        <Link href={`/${locale}`} className="font-semibold text-lg">
          {t('site_title')}
        </Link>
        
        {/* Navigazione principale */}
        <nav aria-label={t('main_navigation_label')} className="flex gap-4 text-sm">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href
                ? 'font-semibold underline underline-offset-4'
                : 'hover:underline underline-offset-4'}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}