// app/api/education/modules/route.ts - VERSIONE DEFINITIVAMENTE CORRETTA
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

function extractI18nText(i18nData: any, locale: string = 'it'): string {
  if (!i18nData) return '';
  if (typeof i18nData === 'string') return i18nData;
  if (typeof i18nData === 'object') {
    // Struttura REALE: { it: "...", en: "...", de: "...", es: "...", fr: "..." }
    return i18nData[locale] || i18nData.it || i18nData.en || '';
  }
  return '';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    
    // ⚠️ IMPORTANTE: I parametri dalla URL
    const macroAreaId = searchParams.get('macro_area');  // "money_transactions"
    const ageLevelId = searchParams.get('age_level');    // "11_15" (con underscore!)
    const locale = searchParams.get('locale') || 'it';

    console.log('🔍 API Modules params:', { macroAreaId, ageLevelId, locale });

    if (!macroAreaId || !ageLevelId) {
      return NextResponse.json(
        { error: 'Parameters required: macro_area and age_level', modules: [] },
        { status: 400 }
      );
    }

    // ✅ CORREZIONE: Query con colonne ESATTE
    // ⚠️ NOTA: ageLevelId è già "11_15" (formato DB), NON "11-15"
    const { data: modules, error } = await supabase
      .from('educational_modules')
      .select(`
        id,
        title_i18n,
        description_i18n,
        age_level_id,
        macro_area_id,
        difficulty_level,
        estimated_duration,
        sort_order,
        is_active
      `)
      .eq('macro_area_id', macroAreaId)
      .eq('age_level_id', ageLevelId)  // ⚠️ usa DIRECTAMENTE "11_15"
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        error: 'Database query failed', 
        modules: [] 
      }, { status: 500 });
    }

    console.log(`✅ Found ${modules?.length || 0} modules`);

    // ✅ CORREZIONE: Mappatura con nomi ESATTI
    const formattedModules = (modules || []).map(module => {
      // DEBUG logging
      console.log('Module keys:', Object.keys(module));
      
      return {
        id: module.id,
        title: extractI18nText(module.title_i18n, locale),
        description: extractI18nText(module.description_i18n, locale),
        // ⚠️ IMPORTANTE: Proprietà dalla query
        age_level: module.age_level_id,
        macro_area: module.macro_area_id,
        difficulty_level: module.difficulty_level || 'beginner',
        estimated_duration: module.estimated_duration || 0,
        sort_order: module.sort_order || 0,
        is_active: module.is_active !== false
      };
    });

    return NextResponse.json({
      success: true,
      modules: formattedModules,
      count: formattedModules.length,
      // Debug info
      _debug: {
        query_params: { macroAreaId, ageLevelId, locale },
        db_columns_used: ['id', 'title_i18n', 'description_i18n', 'age_level_id', 'macro_area_id', 'difficulty_level', 'estimated_duration', 'sort_order', 'is_active']
      }
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ✅ CRITICO: Dynamic export per evitare static optimization
export const dynamic = 'force-dynamic';