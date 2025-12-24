// pages/api/education/modules.js - VERSIONE CORRETTA
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { query } = req;
    console.log('📡 API modules called with:', query);
    
    // Parameters
    const { macro_area, age_level, locale = 'it' } = query;
    
    if (!macro_area || !age_level) {
      return res.status(400).json({ error: 'Parameters required', modules: [] });
    }
    
    // ⚠️ CORREZIONE: Query SENZA 'is_active' (colonna inesistente)
    const { data: modules, error } = await supabase
      .from('educational_modules')
      .select('id, title_i18n, description_i18n, age_level_id, macro_area_id, difficulty_level, estimated_duration, sort_order')
      .eq('macro_area_id', macro_area)
      .eq('age_level_id', age_level)
      // ⚠️ RIMOSSO: .eq('is_active', true) - questa colonna NON ESISTE!
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('❌ Database error:', error);
      return res.status(200).json({ modules: [] });
    }
    
    console.log(`✅ Trovati ${modules?.length || 0} moduli dal DB`);
    
    // Helper i18n
    const getI18nText = (i18nData, locale) => {
      if (!i18nData) return '';
      if (typeof i18nData === 'string') return i18nData;
      if (typeof i18nData === 'object') {
        return i18nData[locale] || i18nData.it || i18nData.en || '';
      }
      return '';
    };
    
    // Format response SENZA 'is_active'
    const formattedModules = (modules || []).map(module => ({
      id: module.id,
      title: getI18nText(module.title_i18n, locale),
      description: getI18nText(module.description_i18n, locale),
      age_level: module.age_level_id,
      macro_area: module.macro_area_id,
      difficulty_level: module.difficulty_level || 'beginner',
      estimated_duration: module.estimated_duration || 0,
      sort_order: module.sort_order || 0
      // ⚠️ RIMOSSO: is_active: module.is_active
    }));
    
    res.status(200).json({
      success: true,
      modules: formattedModules,
      count: formattedModules.length,
      debug: {
        query_params: { macro_area, age_level, locale },
        db_table: 'educational_modules'
      }
    });
    
  } catch (error) {
    console.error('❌ API modules error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}