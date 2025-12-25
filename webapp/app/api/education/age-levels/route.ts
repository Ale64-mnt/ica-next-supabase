export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    const macro_area = searchParams.get('macro_area');

    if (!macro_area) {
      return NextResponse.json({ error: 'macro_area parameter is required' }, { status: 400 });
    }

    // 1. Trova le fasce d'età collegate alla macro area
    const { data: relations, error: relationsError } = await supabase
      .from('macro_area_age_levels')
      .select('age_level_id')
      .eq('macro_area_id', macro_area);

    if (relationsError) {
      return NextResponse.json({ error: relationsError.message }, { status: 500 });
    }

    if (!relations || relations.length === 0) {
      return NextResponse.json([]);
    }

    // 2. Estrai gli ID delle fasce d'età
    const ageLevelIds = relations.map(rel => rel.age_level_id);

    // 3. Fetcha i dettagli delle fasce d'età
    const { data: ageLevels, error: ageLevelsError } = await supabase
      .from('age_levels')
      .select('*')
      .in('id', ageLevelIds)
      .order('sort_order', { ascending: true });

    if (ageLevelsError) {
      return NextResponse.json({ error: ageLevelsError.message }, { status: 500 });
    }

    // 4. Trasforma i dati
    const transformedData = ageLevels.map(level => ({
      id: level.id,
      label: level.label_i18n?.[locale] || level.label_i18n?.en || level.id,
      age_range: level.id,
      description: level.description_i18n?.[locale] || level.description_i18n?.en || `Contenuti educativi personalizzati per ${level.id} anni`,
      sort_order: level.sort_order
    }));

    return NextResponse.json(transformedData);
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

