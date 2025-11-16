import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicClient();
    
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const { data: ageLevels, error } = await supabase
      .from('age_levels')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedData = ageLevels.map(level => ({
      id: level.id,
      label: level.label_i18n?.[locale] || level.label_i18n?.en || level.id,
      sort_order: level.sort_order
    }));

    return NextResponse.json({ ageLevels: transformedData });
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';