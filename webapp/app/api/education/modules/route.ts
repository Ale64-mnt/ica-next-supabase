// app/api/education/modules/route.ts - VERSIONE CORRETTA
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

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
    
    // 🔥 QUERY CRITICA: SOLO moduli con competenze
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
        module_competencies (
          competency_id,
          eu_competencies (
            competency_text_i18n
          )
        )
      `)
      .eq('macro_area_id', macroAreaId)
      .eq('age_level_id', ageLevelSlug)
      .not('module_competencies', 'is', null)  // 🔥 SOLO con competenze
      .order('sort_order', { ascending: true });
      
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ modules: [] }, { status: 200 });
    }
    
    console.log(`✅ Trovati ${modules?.length || 0} moduli REALI`);
    
    if (!modules || modules.length === 0) {
      return NextResponse.json({ modules: [] });
    }
    
    // Formatta risposta
    const formattedModules = modules.map(module => ({
      id: module.id,
      title: module.title_i18n?.[locale] || module.title_i18n?.it || 'Senza titolo',
      description: module.description_i18n?.[locale] || module.description_i18n?.it || '',
      ageLevel: module.age_level_id,
      difficulty: module.difficulty_level || 'Principiante',
      duration: module.estimated_duration ? `${module.estimated_duration} min` : 'Variabile',
      competencies: module.module_competencies.map((mc: any) => ({
        id: mc.competency_id,
        text: mc.eu_competencies?.competency_text_i18n?.[locale] || 
              mc.eu_competencies?.competency_text_i18n?.it || ''
      }))
    }));
    
    return NextResponse.json({ modules: formattedModules });
    
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', modules: [] },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';