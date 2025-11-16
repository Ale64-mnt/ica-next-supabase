import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import AgeLevelsGrid from '@/app/components/education/AgeLevelsGrid';

interface PageProps {
  params: {
    macro_area: string;
    locale: string;
  };
}

// Metadata dinamica per SEO
export async function generateMetadata({ params }: PageProps) {
  const { macro_area, locale } = params;
  
  return {
    title: `${macro_area} - Financial Education`,
  };
}

export default function MacroAreaPage({ params }: PageProps) {
  const { macro_area } = params;
  const t = useTranslations('Education');

  // Validazione macro area
  const validMacroAreas = ['money_transactions', 'planning_budgeting', 'managing_risks_insurance', 'financial_landscape'];
  if (!validMacroAreas.includes(macro_area)) {
    notFound();
  }

  const macroAreaTitles = {
    money_transactions: t('macro_areas.money_transactions'),
    planning_budgeting: t('macro_areas.planning_budgeting'),
    managing_risks_insurance: t('macro_areas.managing_risks_insurance'),
    financial_landscape: t('macro_areas.financial_landscape')
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {macroAreaTitles[macro_area as keyof typeof macroAreaTitles]}
        </h1>
        <p className="text-lg text-gray-600">
          {t('select_age_group_instruction')}
        </p>
      </div>

      {/* Griglia Fasce d'Età */}
      <AgeLevelsGrid macroArea={macro_area} />
    </div>
  );
}