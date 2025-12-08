// app/[locale]/education/money_transactions/[age]/page.tsx
import { getTranslations } from 'next-intl/server';
import { supabaseClient } from '@/app/lib/supabase/client';
import Link from 'next/link';

interface AgePageProps {
  params: {
    locale: string;
    age: string;
  };
}

interface EUTheme {
  id: string;
  title_i18n: string | Record<string, string>;
  sort_order: number;
}

interface EUObjective {
  id: string;
  objective_text_i18n: string | Record<string, string>;
  sort_order: number;
  theme_id: string;
  eu_themes: EUTheme[];
}

interface EducationalModule {
  id: string;
  title_i18n: string | Record<string, string>;
  description_i18n: string | Record<string, string>;
  type: string;
  estimated_time: string;
  age_level_id: string;
  macro_area_id: string;
  sector_id: string;
}

// Helper per estrarre testo nella lingua corretta
function getText(
  i18nText: string | Record<string, string> | undefined, 
  locale: string, 
  fallback: string = ''
): string {
  if (!i18nText) return fallback;
  
  if (typeof i18nText === 'string') {
    return i18nText;
  }
  
  // Se è un oggetto JSON, estrai la lingua corretta
  const text = i18nText[locale] || i18nText.it || i18nText.en || fallback;
  return text || fallback;
}

export default async function MoneyTransactionsAgePage({ params }: AgePageProps) {
  const { age, locale } = params;
  const t = await getTranslations('Education');
  const supabase = supabaseClient;

  // 1. Ottieni gli obiettivi UE per questa fascia d'età
  const { data: euObjectives } = await supabase
    .from('eu_learning_objectives')
    .select(`
      id,
      objective_text_i18n,
      sort_order,
      theme_id,
      eu_themes!inner (
        id,
        title_i18n,
        sort_order
      )
    `)
    .eq('age_level_id', age.replace('-', '_'))
    .eq('eu_themes.sector_id', 'sector_1_money_and_transactions')
    .order('eu_themes.sort_order', { ascending: true })
    .order('sort_order', { ascending: true });

  // 2. Raggruppa obiettivi per tema
  const objectivesByTheme: Record<string, EUObjective[]> = {};
  
  euObjectives?.forEach((obj: EUObjective) => {
    const themeName = getText(
      obj.eu_themes[0]?.title_i18n, 
      locale, 
      'Tema sconosciuto'
    );
    
    if (!objectivesByTheme[themeName]) {
      objectivesByTheme[themeName] = [];
    }
    objectivesByTheme[themeName].push(obj);
  });

  // 3. Ottieni i moduli educativi disponibili per questa fascia
  const { data: educationalModules } = await supabase
    .from('educational_modules')
    .select('*')
    .eq('age_level_id', age.replace('-', '_'))
    .eq('sector_id', 'sector_1_money_and_transactions')
    .order('sort_order', { ascending: true });

  // Usa le traduzioni dal server
  const pageTitle = t('money_transactions_age_page.title', { age });
  const pageDescription = t('money_transactions_age_page.description');
  const objectivesTitle = t('money_transactions_age_page.objectives_title');
  const modulesTitle = t('money_transactions_age_page.modules_title');
  const progressTitle = t('money_transactions_age_page.progress_title');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {pageTitle}
        </h1>
        <p className="text-gray-600">
          {pageDescription}
        </p>
      </div>

      {/* Sezione 1: Obiettivi UE */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {objectivesTitle}
          </h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {euObjectives?.length || 0} {t('money_transactions_age_page.objectives_count')}
          </span>
        </div>

        {Object.entries(objectivesByTheme).map(([themeName, objectives]) => (
          <div key={themeName} className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {themeName}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {objectives.map((obj, index) => (
                <div key={obj.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-800">
                        {getText(obj.objective_text_i18n, locale)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {t('money_transactions_age_page.eu_objective')}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {t('money_transactions_age_page.age_group', { age })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sezione 2: Moduli Educativi */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {modulesTitle}
          </h2>
          <span className="text-sm text-gray-500">
            {(educationalModules?.length || 0) + 1} {t('money_transactions_age_page.activities_count')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Modulo "Bisogni vs Desideri" (esistente) */}
          <Link 
            href={`/education/money_transactions/${age}/needs-vs-wants`}
            className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('needs_vs_wants_game.title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('needs_vs_wants_game.subtitle')}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                {t('needs_vs_wants_game.type')}
              </span>
              <span className="text-sm text-gray-500">{t('needs_vs_wants_game.duration')}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <strong>{t('money_transactions_age_page.covered_objectives')}:</strong> {objectivesByTheme[t('needs_vs_wants_game.title')]?.length || 0}/2
              </p>
            </div>
          </Link>

          {/* Moduli futuri */}
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-gray-400">+</span>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {t('money_transactions_age_page.new_module')}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {t('money_transactions_age_page.module_in_development')}
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              {t('money_transactions_age_page.suggest_activity')}
            </button>
          </div>

          {/* Altri moduli esistenti */}
          {educationalModules?.map((module: EducationalModule) => (
            <div key={module.id} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getText(module.title_i18n, locale)}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getText(module.description_i18n, locale)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                  {module.type || t('money_transactions_age_page.educational_module')}
                </span>
                <span className="text-sm text-gray-500">
                  {module.estimated_time || t('money_transactions_age_page.variable_duration')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {progressTitle}
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {t('money_transactions_age_page.completed_objectives')}
              </span>
              <span className="text-sm font-medium text-gray-700">
                0/{euObjectives?.length || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {t('money_transactions_age_page.complete_modules_message')}
          </p>
        </div>
      </div>
    </div>
  );
}