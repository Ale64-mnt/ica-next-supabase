// File: app/lib/api/education.ts
import { supabaseClient } from '@/app/lib/supabase/client';

// 1. Definizione del tipo per le domande
type QuestionType = {
  id: string;
  question_text: string;
  options: string[] | Record<string, string>;
  correct_answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

// 2. Recupera domande del modulo - CORRETTA CON MAPPATURA


export async function getModuleQuestions(
  moduleId: string, 
  testType: 'diagnostic' | 'final',
  locale: string = 'it'
): Promise<Array<{
  id: string;
  question_text: string;
  options: string[] | Record<string, string>;
  correct_answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}>> {  // 🔥 RIMOSSO QuestionType, messo tipo inline
  try {
    const dbTestType = testType === 'diagnostic' ? 'pre' : 'post';
    
    // 🔥 VERIFICA CHE supabaseClient SIA IMPORTATO
    // All'inizio del file dovresti avere:
    // import { supabaseClient } from '@/app/lib/supabase/client';
    
    const { data: questions, error } = await supabaseClient
      .from('module_test_questions')
      .select('*')
      .eq('module_id', moduleId)
      .eq('test_type', dbTestType)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Errore nel recupero domande:', error);
      return [];
    }
    
    console.log(`✅ Trovate ${questions?.length || 0} domande tipo ${dbTestType}`);
    
    if (!questions || questions.length === 0) {
      console.warn(`⚠️ Nessuna domanda trovata`);
      return [];
    }
    
    return questions.map((q: any) => {
      const questionText = q.question_text_i18n?.[locale] || 
                          q.question_text_i18n?.['en'] || 
                          'Domanda';
      
      const explanation = q.explanation_i18n?.[locale] || 
                         q.explanation_i18n?.['en'] || 
                         '';
      
      // 🔥 CORREZIONE PER L'ERRORE REACT
      let options: string[] | Record<string, string> = [];
      const optionsRaw = q.options_i18n;
      
      if (optionsRaw) {
        if (Array.isArray(optionsRaw)) {
          options = optionsRaw.map(opt => String(opt));
        }
        else if (typeof optionsRaw === 'object') {
          const localeOptions = optionsRaw[locale] || optionsRaw['en'] || optionsRaw;
          
          if (Array.isArray(localeOptions)) {
            options = localeOptions.map(opt => String(opt));
          } 
          else if (localeOptions && typeof localeOptions === 'object') {
            const simpleOptions: Record<string, string> = {};
            
            for (const [key, value] of Object.entries(localeOptions)) {
              if (value && typeof value === 'object' && value !== null) {
                const obj = value as any;
                simpleOptions[key] = String(
                  obj.text || 
                  obj.label || 
                  obj.value || 
                  obj.content || 
                  JSON.stringify(value).substring(0, 100)
                );
              } else {
                simpleOptions[key] = String(value);
              }
            }
            
            options = simpleOptions;
          }
        }
      }
      
      // Difficoltà
      const difficultyLevel = q.difficulty_level || 2;
      let difficulty: "easy" | "medium" | "hard";
      
      if (difficultyLevel === 1) difficulty = "easy";
      else if (difficultyLevel === 3) difficulty = "hard";
      else difficulty = "medium";
      
      return {
        id: String(q.id),
        question_text: String(questionText),
        options: options,
        correct_answer: String(q.correct_answer || ''),
        explanation: String(explanation),
        difficulty: difficulty,
        points: Number(q.points || 10)
      };
    });
    
  } catch (error) {
    console.error('Errore getModuleQuestions:', error);
    return [];
  }
}

// 3. Recupera modulo per ID
export async function getModuleById(moduleId: string, locale: string = "it") {
  try {
    const { data: moduleData, error } = await supabaseClient
      .from('educational_modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (error) throw error;

    return {
      id: moduleData.id,
      title_i18n: moduleData.title_i18n || { [locale]: 'Modulo' },
      description_i18n: moduleData.description_i18n || { [locale]: '' },
      sort_order: moduleData.sort_order || 1,
      estimated_duration_minutes: moduleData.estimated_duration_minutes || 90,
      is_active: moduleData.is_active ?? true,
      created_at: moduleData.created_at
    };
  } catch (error) {
    console.error('Errore getModuleById:', error);
    return {
      id: moduleId,
      title_i18n: { [locale]: 'Modulo Educativo' },
      description_i18n: { [locale]: '' },
      sort_order: 1,
      estimated_duration_minutes: 90,
      is_active: true,
      created_at: new Date().toISOString()
    };
  }
}

// 4. Altre funzioni
export async function getModuleScenarios(moduleId: string, locale: string = "it") {
  try {
    const { data: scenarios, error } = await supabaseClient
      .from('module_game_scenarios')
      .select('*')
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .order('level_number', { ascending: true });

    if (error) throw error;
    
    return scenarios || [];
  } catch (error) {
    console.error('Errore getModuleScenarios:', error);
    return [];
  }
}

// 5. Funzione di test
export async function testEducationAPI() {
  const moduleId = '4e0045e9-7e21-492d-a479-c400425a069d';
  const diagnostic = await getModuleQuestions(moduleId, 'diagnostic', 'it');
  const final = await getModuleQuestions(moduleId, 'final', 'it');
  
  console.log('Test Education API:');
  console.log(`- Diagnostic questions: ${diagnostic.length}`);
  console.log(`- Final questions: ${final.length}`);
  
  return { diagnostic, final };
}