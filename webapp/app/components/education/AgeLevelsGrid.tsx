'use client';
import React from 'react';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { 
  AccessibleCard, 
  AccessibleGrid, 
  AccessibleLoading 
} from '@/app/components/education/accessibility';

interface AgeLevel {
  id: string;
  label: string;
  sort_order: number;
}

interface AgeLevelsGridProps {
  macroArea: string;
}

export default function AgeLevelsGrid({ macroArea }: AgeLevelsGridProps) {
  const locale = useLocale();
  const t = useTranslations('Education');
  const [ageLevels, setAgeLevels] = useState<AgeLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgeLevels() {
      try {
        const response = await fetch(`/api/education/age-levels?locale=${locale}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch age levels');
        }
        
        const data = await response.json();
        setAgeLevels(data.ageLevels);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchAgeLevels();
  }, [locale]);

  if (loading) {
    return (
      <AccessibleLoading 
        itemCount={7}
        aria-label={t('loading_age_groups')}
        message={t('loading_age_groups')}
      />
    );
  }

  if (error) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">
          {t('load_error_age_groups')}
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="sr-only">
        {t('available_age_groups')}
      </h2>
      
      <AccessibleGrid aria-label={t('age_groups_list')} columns={2}>
        {ageLevels.map((level) => (
          <AccessibleCard
            key={level.id}
            title={level.label}
            description={t('age_group_description')}
            href={`/education/${macroArea}/${level.id}`}
            role="link"
          />
        ))}
      </AccessibleGrid>
    </>
  );
}
