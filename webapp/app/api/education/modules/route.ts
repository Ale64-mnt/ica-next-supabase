// app/api/education/modules/route.ts - VERSIONE CORRETTA CON PARSING JSON
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

// Helper per parsare JSON sicuro
function parseI18nJson(jsonData: any): Record<string, string> | null {
  if (!jsonData) return null;
  
  if (typeof jsonData === 'object' && jsonData !== null) {
    return jsonData; // Già un oggetto
  }
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData);
    } catch (e) {
      console.warn('⚠️ Failed to parse JSON:', jsonData?.substring(0, 100));
      return null;
    }
  }
  
  return null;
}

// Helper per estrarre testo tradotto
function getTranslatedText(
  i18nData: any, 
  locale: string, 
  fallback: string = ''
): string {
  const parsed = parseI18nJson(i18nData);
  if (!parsed) return fallback;
  
  return parsed[locale] || 
         parsed['it'] || 
         parsed['en'] || 
         fallback;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    const macroAreaId = searchParams.get('macro_area');
    const ageLevelSlug = searchParams.get('age_level');
    const locale = searchParams.get('locale') || 'it';
    
    console.log('🔍 API Modules called:', { macroAreaId, ageLevelSlug, locale });
    
    if (!macroAreaId || !ageLevelSlug) {
      return NextResponse.json(
        { error: 'macro_area and age_level parameters are required', modules: [] },
        { status: 400 }
      );
    }
    
    // QUERY SEMPLIFICATA - Rimuovi filtro competenze se causa problemi
    const { data: modules, error } = await supabase
      .from('educational_modules')
      .select(`
        id,
        title_i18n,
        description_i18n,
        age_level_id,
        difficulty_level,
        estimated_duration,
        macro_area_id,
        sort_order
      `)
      .eq('macro_area_id', macroAreaId)
      .eq('age_level_id', ageLevelSlug)
      .order('sort_order', { ascending: true });
      
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ modules: [] }, { status: 200 });
    }
    
    console.log(`✅ Trovati ${modules?.length || 0} moduli dal DB`);
    
    if (!modules || modules.length === 0) {
      return NextResponse.json({ modules: [] });
    }
    
    // DEBUG: Mostra il primo modulo RAW
    console.log('🔍 DEBUG Primo modulo RAW:');
    console.log('  ID:', modules[0]?.id);
    console.log('  title_i18n type:', typeof modules[0]?.title_i18n);
    console.log('  title_i18n value:', modules[0]?.title_i18n?.substring?.(0, 100) || modules[0]?.title_i18n);
    console.log('  locale richiesta:', locale);
    
    // Formatta risposta CON PARSING JSON
    const formattedModules = modules.map(module => {
      const title = getTranslatedText(module.title_i18n, locale, 'Untitled Module');
      const description = getTranslatedText(module.description_i18n, locale, '');
      
      return {
        id: module.id,
        title,
        description,
        ageLevel: module.age_level_id,
        difficulty: module.difficulty_level || 'beginner',
        duration: module.estimated_duration ? `${module.estimated_duration} min` : 'Variable',
        competencies: [] // Temporaneamente vuoto per test
      };
    });
    
    console.log('📦 Primo modulo tradotto:');
    console.log('  Title:', formattedModules[0]?.title);
    console.log('  Description:', formattedModules[0]?.description?.substring(0, 50) + '...');
    
    return NextResponse.json({ 
      modules: formattedModules,
      debug: {
        total: formattedModules.length,
        requested_locale: locale,
        first_module_title: formattedModules[0]?.title
      }
    });
    
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', modules: [] },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';