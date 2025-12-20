import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'it';

    console.log('API modulo chiamato:', params.moduleId, 'locale:', locale);

    // 1. Fetch modulo
    const { data: module, error: moduleError } = await supabase
      .from('educational_modules')
      .select(`
        id,
        macro_area_id,
        age_level_id,
        title_i18n,
        description_i18n,
        estimated_duration,
        difficulty_level,
        sort_order,
        sector_id,
        created_at
      `)
      .eq('id', params.moduleId)
      .single();

    if (moduleError || !module) {
      console.log('Errore fetch modulo:', moduleError?.message);
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    // 2. Estrai testo localizzato
    const getLocalizedText = (i18nField: any, fieldName: string): string => {
      if (!i18nField) return `[${fieldName} non disponibile]`;
      
      if (i18nField[locale]) return i18nField[locale];
      if (i18nField['it']) return i18nField['it'];
      
      const firstLang = Object.keys(i18nField)[0];
      if (firstLang) return i18nField[firstLang];
      
      return `[${fieldName} non tradotto]`;
    };

    // 3. Fetch scenari
    let scenarios: any[] = [];
    try {
      const { data: scenariosData } = await supabase
        .from('module_game_scenarios')
        .select('*')
        .eq('module_id', params.moduleId)
        .order('level_number')
        .order('scenario_number');
      
      scenarios = scenariosData || [];
    } catch (scenarioError) {
      console.log('Errore scenari:', scenarioError);
    }

    // 4. Costruisci risposta
    const response = {
      success: true,
      module: {
        id: module.id,
        title: getLocalizedText(module.title_i18n, 'title'),
        description: getLocalizedText(module.description_i18n, 'description'),
        macro_area: module.macro_area_id,
        age_level: module.age_level_id,
        duration: module.estimated_duration,
        difficulty: module.difficulty_level,
        created_at: module.created_at,
      },
      content: {
        scenarios: {
          count: scenarios.length,
          items: scenarios
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('ERRORE API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}