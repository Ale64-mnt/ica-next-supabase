import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();

  // Link Legali e WCAG: Ogni sito deve avere una Dichiarazione di Accessibilità
  const legalLinks = [
    { label: t('privacy_policy'), href: '/privacy' },
    { label: t('terms_of_service'), href: '/terms' },
    { label: t('accessibility_statement'), href: '/accessibility' }, 
  ];

  return (
    <footer 
      style={{ 
        backgroundColor: '#f4f4f4', 
        borderTop: '1px solid #eee', 
        padding: '2rem',
        marginTop: '3rem',
        color: '#666',
        fontSize: '0.9em',
      }}
      // WCAG: L'elemento footer ha un ruolo semantico 'contentinfo'
    >
      <div 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Link Legali e Utili */}
        <nav aria-label={t('footer_navigation_label')}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link href={`/${locale}${item.href}`} style={{ textDecoration: 'none', color: '#666' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Sezione Copyright e Contatti */}
        <div style={{ lineHeight: 1.6, marginTop: '1rem' }}>
          <p>&copy; {new Date().getFullYear()} ICA Webapp. {t('all_rights_reserved')}.</p>
          <p>
            {t('contact_us_label')}: <a href="mailto:info@icawebapp.com" style={{ color: '#0070f3' }}>info@icawebapp.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
