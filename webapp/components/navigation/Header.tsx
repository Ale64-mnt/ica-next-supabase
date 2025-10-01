import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from './LocaleSwitcher'; 
import Image from 'next/image';

// Componente Server per l'intestazione globale
export default function Header() {
  const t = useTranslations('Navigation');
  const locale = useLocale();

  // Definiamo i link principali
  const navItems = [
    { label: t('home_link'), href: '/' },
    { label: t('blog_link'), href: '/blog' },
    // Aggiungi qui altri link principali come 'Contatti' o 'Chi Siamo'
    // Stiamo usando il percorso '/articles' per l'elenco degli articoli, anche se l'elenco principale è in Homepage
  ];

  return (
    <header 
      style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #eee', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', // Rende l'header fisso in alto
        top: 0,
        zIndex: 50,
      }}
      // WCAG: L'elemento header ha un ruolo semantico 'banner'
    >
      {/* Logo/Nome del Sito (Link alla Homepage) */}
      <Link href={`/${locale}`} style={{ textDecoration: 'none', color: '#333' }}>
        {/* WCAG: Usiamo il componente Image con alt descrittivo. Assumi che il logo sia in /public/logo.svg */}
        <Image src="/logo.svg" alt={t('site_logo_alt')} width={120} height={30} priority />
      </Link>

      {/* Navigazione Principale */}
      <nav aria-label={t('main_navigation_label')}>
        <ul 
          style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            display: 'flex', 
            gap: '1.5rem',
          }}
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={`/${locale}${item.href}`} 
                style={{ 
                  textDecoration: 'none', 
                  color: '#333', 
                  fontWeight: 500,
                  padding: '5px 0',
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Selettore Lingua */}
      <LocaleSwitcher />
    </header>
  );
}
