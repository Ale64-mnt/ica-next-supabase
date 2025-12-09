// File: app/api/education/progress/route.ts
export const dynamic = 'force-dynamic';
import { createClient } from "@/app/lib/supabase/server"
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' }, 
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const ageLevel = searchParams.get('age')
    const macroArea = searchParams.get('area')
    
    // Query base per progresso
    let query = supabase
      .from('user_learning_progress')
      .select('*')
      .eq('user_id', user.id)
    
    if (ageLevel) {
      query = query.eq('age_level_id', ageLevel)
    }
    
    if (macroArea) {
      query = query.eq('macro_area_id', macroArea)
    }
    
    const { data: progressData, error: progressError } = await query
    
    if (progressError) throw progressError
    
    // Ottieni moduli completati
    const { data: modulesData, error: modulesError } = await supabase
      .from('user_module_completions')
      .select(`
        *,
        educational_modules (
          id,
          title_key,
          description_key,
          duration_minutes
        )
      `)
      .eq('user_id', user.id)
    
    if (modulesError) throw modulesError
    
    // Ottieni achievement
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          id,
          name_key,
          description_key,
          icon,
          points
        )
      `)
      .eq('user_id', user.id)
    
    if (achievementsError) throw achievementsError
    
    return NextResponse.json({
      success: true,
      data: {
        overview: progressData?.[0] || {
          modules_completed: 0,
          competencies_completed: 0,
          real_progress_percentage: 0,
          potential_progress_percentage: 0
        },
        modules: modulesData || [],
        achievements: achievementsData || [],
        stats: {
          totalModules: 6, // Moduli implementati
          totalCompetencies: 234, // Totale competenze EU
          lastUpdated: new Date().toISOString()
        }
      }
    })
    
  } catch (error) {
    console.error('Errore API progress:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}