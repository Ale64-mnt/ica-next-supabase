// Export esplicito per evitare caching indesiderato
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient } from '@/app/lib/supabase/public-client';

export async function GET(request: NextRequest) {
  try {
    // Usa il client pubblico senza cookies
    const supabase = createPublicClient();
    
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';
    
    const { data: macroAreas, error } = await supabase
      .from('macro_areas')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const transformedData = macroAreas.map(area => ({
      id: area.id,
      title: area.title_i18n?.[locale] || area.title_i18n?.en || area.id,
      icon: area.icon,
      color_theme: area.color_theme,
      sort_order: area.sort_order
    }));

    return NextResponse.json({ macroAreas: transformedData });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

