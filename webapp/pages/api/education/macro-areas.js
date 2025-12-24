// pages/api/education/macro-areas.js
// Converted from App Router to Pages Router
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { query } = req;
    console.log('API macro-areas called with:', query);
    
    const { locale = 'it' } = query;
    
    const { data: macroAreas, error } = await supabase
      .from('macro_areas')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    
    const getI18nText = (i18nData, locale) => {
      if (!i18nData) return '';
      return i18nData[locale] || i18nData.en || i18nData.it || '';
    };
    
    const transformedData = macroAreas.map(area => ({
      id: area.id,
      title: getI18nText(area.title_i18n, locale),
      icon: area.icon,
      color_theme: area.color_theme,
      sort_order: area.sort_order
    }));
    
    res.status(200).json({ macroAreas: transformedData });
    
  } catch (error) {
    console.error('API macro-areas error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
