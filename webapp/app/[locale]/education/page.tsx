// webapp/app/[locale]/education/page.tsx
import { useTranslations } from 'next-intl';

export default function EducationPage() {
  const t = useTranslations('Education');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Selettore Fasce d'Età - Placeholder */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {t('select_age_group')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Le fasce d'età saranno dinamiche */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">Fasce d'età qui</p>
          </div>
        </div>
      </div>

      {/* Griglia Macro Aree - Placeholder */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {t('learning_areas')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Le macro aree saranno dinamiche */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Macro aree qui</p>
          </div>
        </div>
      </div>
    </div>
  );
}