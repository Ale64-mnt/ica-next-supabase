// app/[locale]/cybercrime-report/page.tsx
import { getTranslations } from 'next-intl/server';
import { CountryCard } from './components/CountryCard';

export default async function CybercrimeReportPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Cybercrime');

  const euCountries = [
    { code: 'austria', flag: '🇦🇹' },
    { code: 'belgium', flag: '🇧🇪' },
    { code: 'bulgaria', flag: '🇧🇬' },
    { code: 'croatia', flag: '🇭🇷' },
    { code: 'cyprus', flag: '🇨🇾' },
    { code: 'denmark', flag: '🇩🇰' },
    { code: 'estonia', flag: '🇪🇪' },
    { code: 'finland', flag: '🇫🇮' },
    { code: 'france', flag: '🇫🇷' },
    { code: 'germany', flag: '🇩🇪' },
    { code: 'greece', flag: '🇬🇷' },
    { code: 'ireland', flag: '🇮🇪' },
    { code: 'italy', flag: '🇮🇹' },
    { code: 'latvia', flag: '🇱🇻' },
    { code: 'lithuania', flag: '🇱🇹' },
    { code: 'luxembourg', flag: '🇱🇺' },
    { code: 'malta', flag: '🇲🇹' },
    { code: 'netherlands', flag: '🇳🇱' },
    { code: 'poland', flag: '🇵🇱' },
    { code: 'portugal', flag: '🇵🇹' },
    { code: 'romania', flag: '🇷🇴' },
    { code: 'slovakia', flag: '🇸🇰' },
    { code: 'slovenia', flag: '🇸🇮' },
    { code: 'spain', flag: '🇪🇸' },
    { code: 'sweden', flag: '🇸🇪' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('eu_countries')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('select_country')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {euCountries.map((country) => (
            <CountryCard
              key={country.code}
              countryCode={country.code}
              flag={country.flag}
            />
          ))}
        </div>
      </section>
    </div>
  );
}