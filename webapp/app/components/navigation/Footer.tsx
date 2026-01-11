// app/components/navigation/Footer.tsx
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'Footer' });

  const legalLinks = [
    { label: t('privacy_policy'), href: '/privacy-policy' },
    { label: t('cookie_policy'), href: '/cookie-policy' }
  ];

  return (
    <footer
      style={{
        backgroundColor: '#f4f4f4',
        borderTop: '1px solid #eee',
        padding: '2rem',
        marginTop: '3rem',
        color: '#4B5563',
        fontSize: '0.9em'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#1F2937' }}>
              {t('links')}
            </h3>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {legalLinks.map((link, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    href={`/${locale}${link.href}`}
                    style={{
                      color: '#4B5563',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                    className="hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#4B5563' }}>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>

          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', fontWeight: 'bold', color: '#374151' }}>
            {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
