// File: app/api/education/modules/[moduleId]/complete/route.ts
import { createClient } from "@/app/lib/supabase/server"
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' }, 
        { status: 401 }
      )
    }
    
    const moduleId = params.moduleId
    const body = await request.json()
    const { progress = 100, timeSpent = 30, score = null } = body
    
    // 1. Verifica se il modulo esiste
    const { data: moduleData, error: moduleError } = await supabase
      .from('educational_modules')
      .select('id, title_key')
      .eq('id', moduleId)
      .single()
    
    if (moduleError || !moduleData) {
      return NextResponse.json(
        { error: 'Modulo non trovato' },
        { status: 404 }
      )
    }
    
    // 2. Registra completamento modulo
    const { error: completionError } = await supabase
      .from('user_module_completions')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        progress_percentage: Math.min(100, Math.max(0, progress)),
        time_spent_minutes: timeSpent,
        score: score,
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,module_id'
      })
    
    if (completionError) throw completionError
    
    // 3. Ottieni competenze correlate al modulo
    const { data: competencies, error: compError } = await supabase
      .from('module_competencies')
      .select('competency_id')
      .eq('module_id', moduleId)
    
    if (compError) throw compError
    
    // 4. Aggiorna progresso competenze
    if (competencies && competencies.length > 0) {
      const updates = competencies.map(comp => ({
        user_id: user.id,
        competency_id: comp.competency_id,
        progress_percentage: Math.min(100, progress),
        last_updated: new Date().toISOString()
      }))
      
      const { error: compProgressError } = await supabase
        .from('user_competency_progress')
        .upsert(updates, {
          onConflict: 'user_id,competency_id'
        })
      
      if (compProgressError) throw compProgressError
    }
    
    return NextResponse.json({
      success: true,
      message: 'Modulo completato con successo',
      data: {
        moduleId,
        progress,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Errore API completamento modulo:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}