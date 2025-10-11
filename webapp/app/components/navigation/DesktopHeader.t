import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';

type DesktopHeaderProps = { locale: string };

export function DesktopHeader({ locale }: DesktopHeaderProps) {
  const t = useTranslations('Navigation');

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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* NAVIGAZIONE - CENTRO con MOLTO più spazio */}
          <nav
            className="flex items-center gap-[40px] mx-[60px]"
            aria-label={t('main_navigation_label')}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={buildHref(link.href)}
                className="text-[15px] font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-all duration-200"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* MENU LINGUE - DESTRA con MOLTO margine */}
          <div className="flex items-center flex-shrink-0 mr-[60px]">
            <LocaleSwitcher />
          </div>

        </div>
      </div>
    </header>
  );
}
