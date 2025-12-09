import { useTranslations } from 'next-intl';
import MacroAreasGrid from '@/app/components/education/MacroAreasGrid';
import ProgressDualView from '@/app/components/education/ProgressDualView';

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

      {/* Progresso Utente */}
      <div className="mb-10">
        <ProgressDualView 
          className="mb-8"
          showDetails={true}
        />
      </div>

      {/* Macro Aree Dinamiche */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {t('learning_areas')}
        </h2>
        <MacroAreasGrid />
      </div>
    </div>
  );
}