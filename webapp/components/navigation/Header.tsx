'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Header({ locale }: { locale: string }) {
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
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 40, 
      width: '100%', 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e5e7eb',
      padding: '0.5rem 0'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        
        margin: '0 auto', 
        padding: '0 1.5rem'
      }}>
        {/* TUTTO SULLA STESSA RIGA - Stile preciso */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          
          {/* LOGO - Senza testo duplicato */}
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image
                src="/logo.png"
                alt={t('site_logo_alt')}
                width={156}
                height={78}
                style={{ height: '4.875rem', width: '9.75rem' }}
              />
            </Link>
          </div>

          {/* MENU - Stesso stile dell'esempio */}
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '2rem',
            margin: '0 2rem'
          }} aria-label={t('main_navigation_label')}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={`/${locale}${link.href}`}
                style={{ 
                  color: '#374151',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          {/* LOCALESWITCHER */}
          <div style={{ flexShrink: 0 }}>
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
