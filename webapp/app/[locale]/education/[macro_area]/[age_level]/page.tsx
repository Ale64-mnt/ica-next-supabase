// app/[locale]/education/[macro_area]/[age_level]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface PageProps {
  params: {
    macro_area: string;
    age_level: string;
    locale: string;
  };
}

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  competencies?: Array<{ id: string; text: string }>;
}

export default function AgeLevelPage({ params }: PageProps) {
  const { macro_area, age_level, locale } = params;
  const t = useTranslations('Education');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FASCE CORRETTE (come nel database)
  const validAgeLevels = ['6-10', '11-15', '16-18'];
  
  if (!validAgeLevels.includes(age_level)) {
    notFound();
  }

  useEffect(() => {
    async function fetchModules() {
      try {
        // Converti 6-10 → 6_10 (formato database)
        const dbAgeLevel = age_level.replace('-', '_');
        
        const response = await fetch(
          `/api/education/modules?macro_area=${macro_area}&age_level=${dbAgeLevel}&locale=${locale}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 Moduli ricevuti:', data.modules);
          setModules(data.modules || []);
        } else {
          console.error('❌ API error:', response.status);
          setModules([]);
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchModules();
  }, [macro_area, age_level, locale]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {t('age_groups.' + age_level.replace('-', '_'))} - {t('macro_areas.' + macro_area)}
        </h1>
        <p className="text-lg text-gray-600">
          {modules.length > 0 
            ? `${modules.length} ${t('modules_available')}` 
            : t('modules_coming_soon')}
        </p>
      </div>

      {/* Lista Moduli REALI */}
      {modules.length > 0 ? (
        <div className="grid gap-6">
          {modules.map((module) => (
            <Link
              key={module.id}
              href={`/${locale}/education/${macro_area}/${age_level}/${module.id}`}
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-green-300"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  {module.id === 'needs-vs-wants' ? '🎯' : 
                   module.id.includes('currency') ? '💱' : '📚'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {module.description}
                  </p>
                  
                  {/* Competenze associate */}
                  {module.competencies && module.competencies.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Competenze:
                      </p>
                      <ul className="space-y-1">
                        {module.competencies.map((comp, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {comp.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex gap-3 text-sm">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      {module.difficulty}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {module.duration}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {module.competencies?.length || 0} competenze
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
          <p className="text-blue-600 mt-2">
            Al momento non ci sono moduli educativi disponibili per questa fascia d&apos;età.
          </p>
        </div>
      )}
    </div>
  );
}
