// app/api/education/modules/route.ts - VERSIONE CORRETTA (SENZA is_active)
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

function extractI18nText(i18nData: any, locale: string = 'it'): string {
  if (!i18nData) return '';
  if (typeof i18nData === 'string') return i18nData;
  if (typeof i18nData === 'object') {
    return i18nData[locale] || i18nData.it || i18nData.en || '';
  }
  return '';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    
    const macroAreaId = searchParams.get('macro_area');
    const ageLevelId = searchParams.get('age_level');
    const locale = searchParams.get('locale') || 'it';

    console.log('🔍 API Modules params:', { macroAreaId, ageLevelId, locale });

    if (!macroAreaId || !ageLevelId) {
      return NextResponse.json(
        { error: 'Parameters required: macro_area and age_level', modules: [] },
        { status: 400 }
      );
    }

    // ✅ CORREZIONE: Query SENZA is_active
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
        sort_order
        
      `)
      .eq('macro_area_id', macroAreaId)
      .eq('age_level_id', ageLevelId)
      
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ 
        error: 'Database query failed', 
        modules: [] 
      }, { status: 500 });
    }

    console.log(`✅ Found ${modules?.length || 0} modules`);

    const formattedModules = (modules || []).map(module => {     
      return {
        id: module.id,
        title: extractI18nText(module.title_i18n, locale),
        description: extractI18nText(module.description_i18n, locale),
        age_level: module.age_level_id,
        macro_area: module.macro_area_id,
        difficulty_level: module.difficulty_level || 'beginner',
        estimated_duration: module.estimated_duration || 0,
        sort_order: module.sort_order || 0,
        
      };
    });

    return NextResponse.json({
      success: true,
      modules: formattedModules,
      count: formattedModules.length
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