// pages/api/education/age-levels.js
// Converted from App Router to Pages Router
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { query } = req;
    console.log('API age-levels called with:', query);
    
    const { macro_area, locale = 'it' } = query;
    
    if (!macro_area) {
      return res.status(400).json({ error: 'macro_area parameter is required' });
    }
    
    // 1. Find age levels for macro area
    const { data: relations } = await supabase
      .from('macro_area_age_levels')
      .select('age_level_id')
      .eq('macro_area_id', macro_area);
    
    if (!relations || relations.length === 0) {
      return res.status(200).json([]);
    }
    
    const ageLevelIds = relations.map(rel => rel.age_level_id);
    
    // 2. Fetch age level details
    const { data: ageLevels, error } = await supabase
      .from('age_levels')
      .select('*')
      .in('id', ageLevelIds)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    
    // 3. Transform
    const transformedData = ageLevels.map(level => ({
      id: level.id,
      label: level.label_i18n?.[locale] || level.label_i18n?.en || level.id,
      age_range: level.id,
      description: level.description_i18n?.[locale] || level.description_i18n?.en || '',
      sort_order: level.sort_order || 0
    }));
    
    res.status(200).json(transformedData);
    
  } catch (error) {
    console.error('API age-levels error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
