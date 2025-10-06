'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('Footer');

  // Link Legali e Utili
  const legalLinks = [
    { label: t('privacy_policy'), href: '/privacy' },
    { label: t('terms_of_service'), href: '/terms' },
    { label: t('accessibility_statement'), href: '/accessibility' },
    { label: t('cookie_policy'), href: '/cookies' },
    { label: t('sitemap'), href: '/sitemap' },
  ];

  // Link Social con icone (segnaposto)
  const socialLinks = [
    { name: 'LinkedIn', href: '#', icon: '🔗' },
    { name: 'X (Twitter)', href: '#', icon: '🐦' },
    { name: 'YouTube', href: '#', icon: '📺' },
    { name: 'Instagram', href: '#', icon: '📷' },
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
    >
      <div 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Link Legali e Utili */}
        <nav aria-label={t('footer_navigation_label')}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1rem', 
            flexWrap: 'wrap', 
            justifyContent: 'center' 
          }}>
            {legalLinks.map((item) => (
              <li key={item.href}>
                <Link 
                  href={`/${locale}${item.href}`} 
                  style={{ textDecoration: 'none', color: '#666' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social Links */}
        <div>
          <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('follow_us')}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                style={{ 
                  fontSize: '1.5rem',
                  textDecoration: 'none',
                  color: '#666',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0070f3'}
                onMouseOut={(e) => e.currentTarget.style.color = '#666'}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Informazioni Multilingue */}
        <div style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          fontSize: '0.8em'
        }}>
          <p style={{ margin: 0 }}>
            🌐 {t('multilingual_site')}
          </p>
        </div>

        {/* Sezione Copyright, Contatti e Data Aggiornamento */}
        <div style={{ lineHeight: 1.6 }}>
          <p>
            &copy; {new Date().getFullYear()} EduEthica. {t('all_rights_reserved')}.
          </p>
          <p style={{ fontSize: '0.8em', margin: '0.5rem 0' }}>
            📅 {t('last_updated')}: {new Date().toLocaleDateString(locale)}
          </p>
          <p>
            📧 {t('contact_us_label')}:{' '}
            <a href="mailto:info@eduethica.com" style={{ color: '#0070f3' }}>
              info@eduethica.com
            </a>
            <br />
            📍 {t('address_label')}:{' '}
            <span style={{ fontStyle: 'italic' }}>{t('address_placeholder')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
