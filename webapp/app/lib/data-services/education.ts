// File: app/lib/data-services/education.ts
import { createClient } from '@/app/lib/supabase/server'; // Modifica il percorso se necessario

/**
 * Tipi per i moduli educativi
 */
export interface EducationModule {
  id: string;
  title: string;
  description: string;
  content: string;
  macro_area: string;
  age_level: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
  locale: string;
  created_at: string;
  updated_at: string;
}

/**
 * Parametri per filtrare i moduli
 */
export interface GetModulesParams {
  macro_area: string;
  age_level: string;
  locale: string;
  limit?: number;
  offset?: number;
}

/**
 * Recupera i moduli educativi dal database
 */
export async function getEducationModules(params: GetModulesParams): Promise<EducationModule[]> {
  try {
    // 1. Inizializza il client Supabase
    const supabase = createClient();
    
    // 2. Costruisci la query
    let query = supabase
      .from('education_modules') // Sostituisci con il nome reale della tua tabella
      .select('*')
      .eq('macro_area', params.macro_area)
      .eq('age_level', params.age_level)
      .eq('locale', params.locale)
      .order('created_at', { ascending: true });
    
    // 3. Applica limit e offset se forniti
    if (params.limit) {
      query = query.limit(params.limit);
    }
    
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    // 4. Esegui la query
    const { data, error } = await query;
    
    // 5. Gestisci errori
    if (error) {
      console.error('Supabase error in getEducationModules:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // 6. Ritorna i dati (o array vuoto)
    return data || [];
    
  } catch (error) {
    console.error('Error in getEducationModules service:', error);
    // In produzione, potresti voler loggare su un servizio esterno
    throw error; // Rilancia per gestione errori superiore
  }
}

/**
 * Recupera un singolo modulo per ID
 */
export async function getEducationModuleById(id: string): Promise<EducationModule | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('education_modules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase error in getEducationModuleById:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getEducationModuleById service:', error);
    return null;
  }
}

/**
 * Recupera tutte le macro-aree disponibili
 */
export async function getMacroAreas(locale: string): Promise<Array<{id: string, name: string}>> {
  try {
    const supabase = createClient();
    
    // Query distinte per evitare duplicati
    const { data, error } = await supabase
      .from('education_modules')
      .select('macro_area')
      .eq('locale', locale)
      .not('macro_area', 'is', null)
      .order('macro_area');
    
    if (error) {
      console.error('Supabase error in getMacroAreas:', error);
      return [];
    }
    
    // Rimuovi duplicati e formatta
    const uniqueAreas = Array.from(
      new Set(data.map(item => item.macro_area))
    ).map(area => ({
      id: area.toLowerCase().replace(/\s+/g, '_'),
      name: area
    }));
    
    return uniqueAreas;
  } catch (error) {
    console.error('Error in getMacroAreas service:', error);
    return [];
  }
}