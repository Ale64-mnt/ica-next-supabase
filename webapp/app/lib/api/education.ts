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

// 2. Recupera domande del modulo - CON DEBUG DETTAGLIAT
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
}>> {
  try {
    const dbTestType = testType === 'diagnostic' ? 'pre' : 'post';
    
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
      // 🔥 CORREZIONE: question_text_i18n.it è oggetto con campo "text"
      const qTextObj = q.question_text_i18n?.[locale] || q.question_text_i18n?.['en'];
      const questionText = (typeof qTextObj === 'object' && qTextObj !== null && 'text' in qTextObj)
        ? String(qTextObj.text)
        : 'Domanda';
      
      // 🔥 CORREZIONE: explanation_i18n.it è oggetto con campo "text"
      const expObj = q.explanation_i18n?.[locale] || q.explanation_i18n?.['en'];
      const explanation = (typeof expObj === 'object' && expObj !== null && 'text' in expObj)
        ? String(expObj.text)
        : '';
      
      // 🔥 CORREZIONE CRITICA: options_i18n.it è ARRAY di oggetti
      let options: string[] | Record<string, string> = [];
      const optionsRaw = q.options_i18n;
      
      if (optionsRaw) {
        // Prendi le opzioni nella lingua corretta
        const localeOptions = optionsRaw[locale] || optionsRaw['en'];
        
        if (Array.isArray(localeOptions)) {
          // 🔥 Conversione: array di oggetti → Record<string, string>
          const optionRecord: Record<string, string> = {};
          
          for (const optionObj of localeOptions) {
            if (optionObj && typeof optionObj === 'object' && 'id' in optionObj && 'text' in optionObj) {
              // Usa 'id' (A, B, C, D) come chiave e 'text' come valore
              optionRecord[optionObj.id] = String(optionObj.text);
            }
          }
          
          options = optionRecord;
        }
      }
      
      // Fallback se options è vuoto
      if (Object.keys(options).length === 0) {
        options = { A: 'Opzione A', B: 'Opzione B', C: 'Opzione C', D: 'Opzione D' };
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