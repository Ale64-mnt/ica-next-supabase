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
  title: string;
  description: string;
  ageLevel: string;
  difficulty: string;
  duration: string;
  competencies?: Array<any>;
  game_scenarios?: Array<{ id: string }>;
  estimated_duration?: number;
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
  const tMoneyPage = await getTranslations('Education.money_transactions_age_page');
  const tCommon = await getTranslations('Common');
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
      t('unknown_theme', { defaultValue: 'Tema sconosciuto' })
    );
    
    if (!objectivesByTheme[themeName]) {
      objectivesByTheme[themeName] = [];
    }
    objectivesByTheme[themeName].push(obj);
  });

  // 3. MODIFICA CHIAVE: Ottieni i moduli DIRETTAMENTE da Supabase
let educationalModules: EducationalModule[] = [];
let totalActivities = 0;

try {
  // ✅ CORREZIONE: Query DIRETTA a Supabase SENZA commenti inline
  const { data: modulesData, error: modulesError } = await supabase
    .from('educational_modules')
    .select(`
      id,
      title_i18n,
      description_i18n,
      age_level_id,
      difficulty_level,
      estimated_duration,
      topics_i18n,
      sort_order
    `)  // ⚠️ RIMOSSI tutti i commenti inline dal select()
    .eq('macro_area_id', 'money_transactions')
    .eq('age_level_id', age.replace('-', '_'))
    .order('sort_order', { ascending: true });

  if (modulesError) {
    console.error('❌ Supabase error fetching modules:', modulesError);
    educationalModules = [];
  } else if (modulesData) {
    // ✅ Trasforma i dati dal formato Supabase al formato atteso dal componente
    educationalModules = modulesData.map((mod: any) => ({
      id: mod.id,
      title: getText(mod.title_i18n, locale) || t('untitled_module', { defaultValue: 'Modulo senza titolo' }),
      description: getText(mod.description_i18n, locale) || '',
      ageLevel: mod.age_level_id,
      difficulty: mod.difficulty_level || 'beginner',
      duration: mod.estimated_duration ? `${mod.estimated_duration} min` : '60 min',
      competencies: mod.topics_i18n || [],
      game_scenarios: []
    }));
    
    console.log('✅ Modules fetched directly from Supabase:', educationalModules.length);
  }
  
  // Calcola il totale delle attività (scenari di gioco)
  totalActivities = educationalModules.reduce((total, module) => {
    return total + (module.game_scenarios?.length || 3);
  }, 0);
  
} catch (error) {
  console.error('❌ Error in direct Supabase query:', error);
  educationalModules = [];
}

  // Usa le traduzioni corrette
  const pageTitle = tMoneyPage('title');
  const pageDescription = tMoneyPage('description');
  const objectivesTitle = tMoneyPage('objectives_title');
  const modulesTitle = tMoneyPage('modules_title');
  const progressTitle = tMoneyPage('progress_title');
  
  // Calcola conteggi per parametri di traduzione
  const totalObjectives = euObjectives?.length || 0;
  const totalModules = educationalModules.length;

  // Funzione per convertire difficoltà in testo leggibile
  const getDifficultyText = (difficulty: string): string => {
    const difficultyMap: Record<string, string> = {
      'beginner': t('difficulty.beginner', { defaultValue: 'Principiante' }),
      'intermediate': t('difficulty.intermediate', { defaultValue: 'Intermedio' }),
      'advanced': t('difficulty.advanced', { defaultValue: 'Avanzato' })
    };
    return difficultyMap[difficulty] || difficulty;
  };

  // ✅ RESTANTE CODICE INVARIATO (solo UI, nessuna modifica)
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
            {tMoneyPage('objectives_count', { count: totalObjectives })}
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
                          {t('eu_objective', { defaultValue: 'Obiettivo UE' })}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {t('age_group_label', { age, defaultValue: `Età ${age}` })}
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
            {tMoneyPage('activities_count', { count: totalActivities })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mostra i moduli reali da Supabase */}
          {educationalModules.map((module) => {
            // Estrai numero di minuti dalla stringa duration
            const durationMatch = module.duration?.match(/(\d+)/);
            const minutes = durationMatch ? parseInt(durationMatch[1]) : 60;
            const hours = minutes >= 60 ? `${Math.floor(minutes / 60)}h ` : '';
            const remainingMinutes = minutes % 60;
            const displayDuration = hours + (remainingMinutes > 0 ? `${remainingMinutes}m` : '');

            return (
              <Link
                key={module.id}
                href={`/${locale}/education/modules/${module.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow hover:border-blue-300 group"
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {module.description}
                  </p>
                  {/* Competenze coperte */}
                  {module.competencies && module.competencies.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 font-medium mb-1">
                        {t('competencies_covered', { defaultValue: 'Competenze coperte' })}:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {module.competencies.slice(0, 2).map((comp: any, idx: number) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs truncate max-w-[120px]"
                            title={typeof comp === 'string' ? comp : comp.title || comp.code}
                          >
                            {typeof comp === 'string' ? comp.substring(0, 15) : (comp.code || comp.title?.substring(0, 15))}
                          </span>
                        ))}
                        {module.competencies.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{module.competencies.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      module.difficulty === 'beginner' 
                        ? 'bg-green-50 text-green-700' 
                        : module.difficulty === 'intermediate'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {getDifficultyText(module.difficulty)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {module.ageLevel?.replace('_', '-') || age}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {displayDuration}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Card "Esplora più moduli" */}
          {educationalModules.length > 0 && educationalModules.length < 6 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-blue-600">✨</span>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                {t('new_modules_coming', { defaultValue: 'Più moduli in arrivo' })}
              </h3>
              <p className="text-gray-600 text-sm mb-6 max-w-md">
                {t('modules_in_development', { defaultValue: 'Stiamo sviluppando nuovi contenuti per ampliare la tua educazione finanziaria' })}
              </p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <span className="text-xs text-gray-500 font-medium">
                  {t('coming_soon', { defaultValue: 'Prossimamente' })}:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs shadow-sm">
                    {t('budget_planning', { defaultValue: 'Pianificazione budget' })}
                  </span>
                  <span className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs shadow-sm">
                    {t('basic_investments', { defaultValue: 'Investimenti base' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card "Nessun modulo" */}
          {educationalModules.length === 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 border-dashed rounded-xl p-8 text-center col-span-1 md:col-span-2 lg:col-span-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-gray-400">⏳</span>
              </div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {t('modules_coming_soon', { defaultValue: 'Moduli in arrivo' })}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {t('modules_in_preparation', { defaultValue: 'Stiamo preparando moduli educativi interattivi per questa fascia d\'età. Torna presto per scoprirli!' })}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {t('gamified_scenarios', { defaultValue: 'Scenari gamificati' })}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {t('interactive_tests', { defaultValue: 'Test interattivi' })}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {t('eu_competencies', { defaultValue: 'Competenze UE' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-12 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
            📊
          </span>
          {progressTitle}
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {t('general_progress', { defaultValue: 'Progresso generale' })}
              </span>
              <span className="text-sm font-medium text-gray-700">
                0/{totalObjectives} {t('objectives', { defaultValue: 'obiettivi' })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: '0%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('complete_modules_to_unlock', { defaultValue: 'Completa i moduli per sbloccare obiettivi' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {totalModules}
              </div>
              <div className="text-sm text-gray-600">
                {t('available_modules', { defaultValue: 'Moduli disponibili' })}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {totalActivities}
              </div>
              <div className="text-sm text-gray-600">
                {t('interactive_activities', { defaultValue: 'Attività interattive' })}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {totalObjectives}
              </div>
              <div className="text-sm text-gray-600">
                {t('eu_objectives', { defaultValue: 'Obiettivi UE' })}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              href={`/${locale}/education`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span>← {t('back_to_education_dashboard', { defaultValue: 'Torna alla dashboard educativa' })}</span>
            </Link>
          </div>
          
          <p className="text-sm text-gray-600 text-center border-t border-gray-100 pt-6">
            {tMoneyPage('complete_modules_message')}
          </p>
        </div>
      </div>
    </div>
  );
}