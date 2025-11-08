import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('Footer');

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
    { name: 'LinkedIn', href: '#', icon: '' },
    { name: 'X (Twitter)', href: '#', icon: '' },
    { name: 'YouTube', href: '#', icon: '' },
    { name: 'Facebook', href: '#', icon: '' },
  ];

  return (
    <footer style={{ backgroundColor: '#f4f4f4', borderTop: '1px solid #eee', padding: '2rem', marginTop: '3rem', color: '#4B5563', fontSize: '0.9em' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Sezione Link Utili e Social */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Link Utili */}
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>{t('links')}</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {legalLinks.map((link, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    href={`/${locale}${link.href}`}
                    style={{ color: '#4B5563', textDecoration: 'none' }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>{t('follow_us')}</h3> {/* CORRETTO: </h3> */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0056b3',
                    color: 'white',
                    borderRadius: '50%',
                    textAlign: 'center',
                    lineHeight: '40px',
                    textDecoration: 'none',
                    fontSize: '1.2rem'
                  }}
                  className="hover:bg-blue-700 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>
              {t('newsletter_signup')}
            </h3> {/* CORRETTO: </h3> */}
            <p style={{ marginBottom: '1rem', lineHeight: '1.5', color: '#4B5563' }}>
              {t('newsletter_description')}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder={t('address_placeholder')}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  flex: 1,
                  fontSize: '0.9rem',
                  color: '#374151'
                }}
              />
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0056b3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                className="hover:bg-blue-700 transition-colors"
              >
                {t('subscribe')}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright e Informazioni */}
        <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#4B5563' }}>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#4B5563' }}>
            {t('last_updated')}: {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#374151' }}>
            {t('all_rights_reserved')}
          </p>
        </div>

      </div>
    </footer>
  );
}