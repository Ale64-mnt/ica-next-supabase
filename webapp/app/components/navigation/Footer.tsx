// app/components/navigation/Footer.tsx - VERSIONE MULTILINGUA DEFINITIVA
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations('Footer');

  // 🔥 MAPPA LOCALE PER JAVASCRIPT
  // I tuoi codici ('it', 'en', etc.) → Codici JavaScript validi ('it-IT', 'en-US', etc.)
  const getValidLocale = (code: string): string => {
    const localeMap: Record<string, string> = {
      'it': 'it-IT',    // Italiano (Italia)
      'en': 'en-US',    // Inglese (Stati Uniti)
      'es': 'es-ES',    // Spagnolo (Spagna)
      'de': 'de-DE',    // Tedesco (Germania)
      'fr': 'fr-FR',    // Francese (Francia)
      'it-IT': 'it-IT', // Se arriva già formattato
      'en-US': 'en-US',
      'es-ES': 'es-ES',
      'de-DE': 'de-DE',
      'fr-FR': 'fr-FR'
    };
    
    // 1. Prendi solo la parte lingua se c'è un trattino
    const baseCode = code.includes('-') ? code.split('-')[0] : code;
    
    // 2. Ritorna la mappatura o default a inglese
    return localeMap[baseCode] || 'en-US';
  };

  const validLocale = getValidLocale(locale);

  // ✅ Solo Privacy Policy e Cookie Policy
  const legalLinks = [
    { label: t('privacy_policy'), href: '/privacy-policy' },
    { label: t('cookie_policy'), href: '/cookie-policy' }
  ];

  // ✅ Social links opzionali
  const socialLinks = [
    { name: 'LinkedIn', href: '#', icon: '' },
    { name: 'X (Twitter)', href: '#', icon: '' },
    { name: 'YouTube', href: '#', icon: '' },
    { name: 'Facebook', href: '#', icon: '' },
  ];

  return (
    <footer style={{ 
      backgroundColor: '#f4f4f4', 
      borderTop: '1px solid #eee', 
      padding: '2rem', 
      marginTop: '3rem', 
      color: '#4B5563', 
      fontSize: '0.9em' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ✅ Layout semplificato */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem', 
          marginBottom: '2rem' 
        }}>
          
          {/* ✅ Link Utili */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: '#1F2937' 
            }}>
              {t('links')}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {legalLinks.map((link, index) => (
                <li key={index} style={{ marginBottom: '0.5rem' }}>
                  <Link 
                    href={link.href}
                    style={{ 
                      color: '#4B5563', 
                      textDecoration: 'none',
                      display: 'inline-block',
                      transition: 'color 0.2s ease'
                    }}
                    className="hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Social Links */}
          <div>
            <h3 style={{ 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: '#1F2937' 
            }}>
              {t('follow_us')}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#0056b3',
                    color: 'white',
                    borderRadius: '50%',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.2s ease'
                  }}
                  className="hover:bg-blue-700"
                  aria-label={`Follow us on ${social.name}`}
                  title={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* ✅ Copyright - CON MAPPA LOCALE CORRETTA */}
        <div style={{ 
          borderTop: '1px solid #d1d5db', 
          paddingTop: '1.5rem', 
          textAlign: 'center' 
        }}>
          <p style={{ 
            margin: '0.5rem 0', 
            fontSize: '0.8rem', 
            color: '#4B5563' 
          }}>
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p style={{ 
            margin: '0.5rem 0', 
            fontSize: '0.8rem', 
            color: '#4B5563' 
          }}>
            {/* 🔥 USA validLocale invece di locale */}
            {t('last_updated')}: {new Date().toLocaleDateString(validLocale, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p style={{ 
            margin: '0.5rem 0', 
            fontSize: '0.8rem', 
            fontWeight: 'bold', 
            color: '#374151' 
          }}>
            {t('all_rights_reserved')}
          </p>
        </div>

      </div>
    </footer>
  );
}