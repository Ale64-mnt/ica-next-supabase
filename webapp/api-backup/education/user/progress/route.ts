// app/api/education/user/progress/route.ts
import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  console.log('[API Progress] Richiesta progresso utente')
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const moduleId = searchParams.get('moduleId')
    
    if (!userId && !moduleId) {
      return NextResponse.json(
        { 
          error: 'Parametri mancanti',
          tip: 'Fornisci almeno userId o moduleId nei query params'
        },
        { status: 400 }
      )
    }
    
    // 1. Inizializza Supabase
    const supabase = createClient()
    
    // 2. Ottieni sessione
    const { data: { session } } = await supabase.auth.getSession()
    console.log(`[API Progress] Sessione: ${session ? 'SI' : 'NO'}`)
    
    // 3. Costruisci query
    let query = supabase
      .from('user_module_progress')
      .select('*')
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }
    
    // 4. Esegui query
    const { data: progressData, error: progressError } = await query
    
    // Se la tabella non esiste, rispondi con dati mock
    if (progressError && progressError.code === '42P01') {
      console.log('[API Progress] Tabella non trovata, restituisco dati mock')
      
      const mockData = moduleId && userId ? {
        status: 'not_started',
        score: 0,
        time_spent: 0,
        user_id: userId,
        module_id: moduleId
      } : []
      
      return NextResponse.json({
        success: true,
        data: mockData,
        warning: 'Tabella non trovata, usando dati mock',
        tip: 'Crea la tabella user_module_progress in Supabase'
      })
    }
    
    if (progressError) {
      console.error('[API Progress] Errore query:', progressError)
      throw progressError
    }
    
    // 5. Risposta
    return NextResponse.json({
      success: true,
      data: progressData || [],
      count: progressData?.length || 0,
      sessionUser: session?.user?.id || 'no-session'
    })
    
  } catch (error: any) {
    console.error('[API Progress] Errore critico:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore recupero progresso',
        message: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}