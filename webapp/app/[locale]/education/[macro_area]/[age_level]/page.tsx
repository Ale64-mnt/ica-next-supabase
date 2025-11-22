// app/[locale]/education/[macro_area]/[age_level]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: {
    macro_area: string;
    age_level: string;
    locale: string;
  };
}

export default function AgeLevelPage({ params }: PageProps) {
  const { macro_area, age_level, locale } = params;
  const t = useTranslations('Education');
  const tGame = useTranslations('NeedsVsWantsGame'); // AGGIUNTO: traduzioni del gioco

  const validAgeLevels = ['6-10', '11-13', '14-16', '17-19', '20-25', '26-35', '36-plus'];
  
  if (!validAgeLevels.includes(age_level)) {
    notFound();
  }

  // Moduli disponibili - USA LE TRADUZIONI PER TITOLO E DESCRIZIONE
  const availableModules = [
    {
      id: 'needs-vs-wants',
      title: tGame('title'), // TRADUZIONE invece di hardcoded
      description: tGame('subtitle'), // TRADUZIONE invece di hardcoded
      icon: '🎯',
      difficulty: 'Easy', // SEMPLICE: usa testo fisso per ora
      duration: '10-15 min',
      available: age_level === '6-10' && macro_area === 'money_transactions'
    }
  ];

  const activeModules = availableModules.filter(module => module.available);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {t('age_groups.' + age_level.replace('-', '_'))} - {t('macro_areas.' + macro_area)}
        </h1>
        <p className="text-lg text-gray-600">
          {t('modules_available_description')}
        </p>
      </div>

      {/* Lista Moduli */}
      {activeModules.length > 0 ? (
        <div className="grid gap-6">
          {activeModules.map((module) => (
            <Link
              key={module.id}
              href={`/${locale}/education/${macro_area}/${age_level}/${module.id}`}
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-green-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{module.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {module.description}
                  </p>
                  <div className="flex gap-3 text-sm">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {module.difficulty}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {module.duration}
                    </span>
                  </div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-blue-800 text-lg font-medium">
            🚧 {t('modules_coming_soon')}
          </p>
        </div>
      )}
    </div>
  );
}