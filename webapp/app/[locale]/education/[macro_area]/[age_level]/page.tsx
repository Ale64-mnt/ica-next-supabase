import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    macro_area: string;
    age_level: string;
    locale: string;
  };
}

export default function AgeLevelPage({ params }: PageProps) {
  const { macro_area, age_level } = params;
  const t = useTranslations('Education');

  console.log('🚀 Age Level Page Loaded:', { macro_area, age_level });

  const validAgeLevels = ['6-10', '11-13', '14-16', '17-19', '20-25', '26-35', '36-plus'];
  if (!validAgeLevels.includes(age_level)) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {t('age_groups.' + age_level.replace('-', '_'))} - {t('macro_areas.' + macro_area)}
        </h1>
        <p className="text-lg text-gray-600">
          {t('modules_available_description')}
        </p>
      </div>

      {/* Qui andrà la lista dei moduli educativi per questa fascia d'età */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          🚧 {t('modules_coming_soon')}
        </p>
      </div>
    </div>
  );
}