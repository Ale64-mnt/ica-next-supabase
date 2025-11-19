'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AgeLevel {
  id: string;
  label: string;
  age_range: string;
  description: string;
  sort_order: number;
}

interface AgeLevelsGridProps {
  macroArea: string;
  locale: string;
}

export default function AgeLevelsGrid({ macroArea, locale }: AgeLevelsGridProps) {
  const t = useTranslations('Education');
  const [ageLevels, setAgeLevels] = useState<AgeLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgeLevels() {
      try {
        setLoading(true);
        console.log('🔄 Fetching age levels for:', { macroArea, locale });
        
        const response = await fetch(`/api/education/age-levels?macro_area=${macroArea}&locale=${locale}`);
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch age levels');
        
        const data = await response.json();
        console.log('📦 API Response data:', data);
        
        setAgeLevels(data);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAgeLevels();
  }, [macroArea, locale]);

  const safeAgeLevels = Array.isArray(ageLevels) ? ageLevels : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-600">{t('loading_age_groups')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {t('load_error_age_groups')}
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t('try_again')}
        </button>
      </div>
    );
  }

  if (safeAgeLevels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nessuna fascia d&apos;età disponibile per questa area</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {safeAgeLevels.map((ageLevel) => (
        <Link
          key={ageLevel.id}
          href={`/education/${macroArea}/${ageLevel.id}`}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
          aria-label={`Esplora moduli per ${ageLevel.label} (${ageLevel.age_range} anni) - ${t('macro_areas.' + macroArea)}`}
        >
          <div className="text-center">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
              {ageLevel.age_range} anni
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              {ageLevel.label}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-3">
              {ageLevel.description}
            </p>
            
            <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
              <span>{t('explore_modules')}</span>
              <svg 
                className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}