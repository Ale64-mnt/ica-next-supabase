'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  AccessibleCard, 
  AccessibleGrid, 
  AccessibleLoading 
} from '@/app/components/education/accessibility';

interface MacroArea {
  id: string;
  title: string;
  icon: string | null;
  color_theme: string | null;
  sort_order: number;
}

export default function MacroAreasGrid() {
  const locale = useLocale();
  const t = useTranslations('Education');
  const [macroAreas, setMacroAreas] = useState<MacroArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // DEBUG: Monitora macroAreas
  useEffect(() => {
    console.log('🔄 MacroAreas updated:', {
      count: macroAreas.length,
      type: typeof macroAreas.length,
      data: macroAreas
    });
  }, [macroAreas]);

  useEffect(() => {
    async function fetchMacroAreas() {
      try {
        setAnnouncement(t('loading_areas'));
        
        const response = await fetch(`/api/education/macro-areas?locale=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch macro areas');
        }
        
        const data = await response.json();
        setMacroAreas(data.macroAreas);
        setAnnouncement(t('areas_loaded', { count: data.macroAreas.length }));
        
        setTimeout(() => setAnnouncement(''), 3000);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setAnnouncement(t('load_error', { error: errorMessage }));
      } finally {
        setLoading(false);
      }
    }

    fetchMacroAreas();
  }, [locale, t]);

  const AnnouncementRegion = () => (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );

  if (loading) {
    return (
      <>
        <AnnouncementRegion />
        <AccessibleLoading 
          itemCount={4}
          aria-label={t('loading_areas')}
          message={t('loading_areas')}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AnnouncementRegion />
        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {t('load_error_title')}
          </h3>
          <p className="text-red-700">
            {t('load_error', { error })}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            {t('try_again')}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AnnouncementRegion />
      
      <h2 className="sr-only">
        {t('available_areas')}
      </h2>
      
      <AccessibleGrid aria-label={t('areas_list')} columns={2}>
        {macroAreas.map((area) => (
          <AccessibleCard
            key={area.id}
            title={area.title}
            description={t(`macro_areas.${area.id}`)}
            href={`/education/${area.id}`}
            role="link"
          />
        ))}
      </AccessibleGrid>
      
      <div className="sr-only" aria-live="polite">
        {t('areas_available', { count: macroAreas.length })}
      </div>
    </>
  );
}