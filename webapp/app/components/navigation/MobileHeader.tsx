// MOBILEHEADER.TSX - Versione completa
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

type MobileHeaderProps = { locale: string };

export async function MobileHeader({ locale }: DesktopHeaderProps) {
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
      <div style={{ maxWidth: 'none', width: '100%', padding: '0 1rem' }}>
        <div className="flex items-center justify-between">
          
          {/* Logo più piccolo per mobile */}
          <div className="flex items-center flex-shrink-0">
            <Link href={`/${locale}`}>
              <Image
                src="/logo.png"
                alt={t('site_logo_alt')}
                width={120}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Hamburger Menu */}
          <button className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>

        {/* Menu mobile espanso (da implementare con stato) */}
        {/* <div className="mt-2 hidden">Menu content</div> */}
      </div>
    </header>
  );
}