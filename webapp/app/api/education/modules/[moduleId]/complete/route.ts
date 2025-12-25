// app/api/education/modules/[moduleId]/complete/route.ts
export const dynamic = 'force-dynamic'

import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'


// ✅ SCHEMA CORRETTO: userId senza .uuid() per testing
const CompleteModuleSchema = z.object({
  userId: z.string().optional(), // ✅ RIMOSSO .uuid() per permettere testing
  score: z.number().min(0).max(100),
  status: z.enum(['diagnostic_completed', 'level_completed', 'scenario_completed', 'module_completed']),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    questionCategory: z.enum(['knowledge', 'comprehension', 'behavior']),
    competencyArea: z.enum(['legal_tender', 'emoney', 'risk_issuer', 'fx_costs', 'fraud_cyber']),
    userAnswer: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    points: z.number().min(0).max(6),
    timeSpentSeconds: z.number().min(0).optional()
  })).optional(),
  scenarioId: z.string().uuid().optional(),
  gameLevel: z.number().min(1).max(5).optional(),
  timeSpent: z.number().min(0).optional(),
  unlockedBadges: z.array(z.string()).optional()
})
// ✅ VALIDAZIONE CONDIZIONALE: answers obbligatorio per diagnostic_completed
.refine((data) => {
  if (data.status === 'diagnostic_completed' || data.status === 'module_completed') {
    return data.answers && data.answers.length > 0
  }
  return true
}, {
  message: "Il campo 'answers' è obbligatorio per diagnostic_completed e module_completed",
  path: ["answers"]
})

// ✅ LOGICA ANALISI LACUNE DAL DOSSIER ORIGINALE
function analyzeKnowledgeGaps(answers: any[]): { gaps: string[], assignedLevels: number[] } {
  console.log('[Analisi Lacune] Analizzando', answers?.length, 'risposte')
  
  const gaps: string[] = []
  const assignedLevels: number[] = []

  if (!answers || answers.length === 0) {
    console.warn('[Analisi Lacune] Nessuna risposta da analizzare')
    return { gaps, assignedLevels }
  }

  const errorCounts: Record<string, number> = {}
  const riskyBehaviorCounts: Record<string, number> = {}
  
  answers.forEach(answer => {
    const category = answer.competencyArea
    
    if (!answer.isCorrect) {
      errorCounts[category] = (errorCounts[category] || 0) + 1
    }
    
    if (answer.questionCategory === 'behavior' && !answer.isCorrect) {
      riskyBehaviorCounts[category] = (riskyBehaviorCounts[category] || 0) + 1
    }
  })
  
  console.log('[Analisi Lacune] Errori per categoria:', errorCounts)
  console.log('[Analisi Lacune] Comportamenti rischiosi:', riskyBehaviorCounts)
  
  // ✅ APPLICA LOGICA DOSSIER ORIGINALE:
  // Se ≥3 errori in "Corso legale" → Livello 1 (pagina 1 dossier)
  
  if (errorCounts['legal_tender'] >= 3) {
    gaps.push('legal_tender_knowledge_gap')
    assignedLevels.push(1)
    console.log('[Analisi Lacune] Assegnato Livello 1 (≥3 errori legal_tender)')
  }
  
  if (errorCounts['emoney'] >= 3) {
    gaps.push('emoney_knowledge_gap')
    assignedLevels.push(2)
    console.log('[Analisi Lacune] Assegnato Livello 2 (≥3 errori emoney)')
  }
  
  if (errorCounts['risk_issuer'] >= 3) {
    gaps.push('risk_issuer_knowledge_gap')
    assignedLevels.push(3)
    console.log('[Analisi Lacune] Assegnato Livello 3 (≥3 errori risk_issuer)')
  }
  
  if (errorCounts['fx_costs'] >= 3) {
    gaps.push('fx_costs_knowledge_gap')
    assignedLevels.push(4)
    console.log('[Analisi Lacune] Assegnato Livello 4 (≥3 errori fx_costs)')
  }
  
  if (riskyBehaviorCounts['fraud_cyber'] >= 2 || errorCounts['fraud_cyber'] >= 3) {
    gaps.push('fraud_cyber_behavior_gap')
    assignedLevels.push(5)
    console.log('[Analisi Lacune] Assegnato Livello 5 (comportamenti rischiosi/frodi)')
  }
  
  // Se nessuna lacuna specifica → assegna tutti i livelli (apprendimento completo)
  if (assignedLevels.length === 0) {
    assignedLevels.push(1, 2, 3, 4, 5)
    console.log('[Analisi Lacune] Nessuna lacuna specifica → assegna tutti i livelli 1-5')
  }
  
  console.log('[Analisi Lacune] Risultato:', { gaps, assignedLevels })
  return { gaps, assignedLevels }
}

// ✅ SALVA RISPOSTE NEL DATABASE
async function saveTestAnswers(
  supabase: any,
  userId: string,
  moduleId: string,
  answers: any[],
  testType: 'diagnostic' | 'final'
) {
  if (!answers || answers.length === 0) {
    console.log('[Save Answers] Nessuna risposta da salvare')
    return null
  }
  
  console.log(`[Save Answers] Salvando ${answers.length} risposte per ${testType}`)
  
  const answersToSave = answers.map(answer => ({
    user_id: userId,
    module_id: moduleId,
    question_id: answer.questionId,
    question_category: answer.questionCategory,
    competency_area: answer.competencyArea,
    test_type: testType,
    user_answer: answer.userAnswer,
    is_correct: answer.isCorrect,
    points_earned: answer.isCorrect ? answer.points : 0,
    time_spent_seconds: answer.timeSpentSeconds || 0,
    answered_at: new Date().toISOString()
  }))
  
  try {
    const { data, error } = await supabase
      .from('user_test_answers')
      .insert(answersToSave)
      .select()
    
    if (error) {
      console.error('[Save Answers] Errore salvataggio:', error)
      throw error
    }
    
    console.log(`[Save Answers] ${answers.length} risposte salvate con successo`)
    return data
  } catch (error) {
    console.error('[Save Answers] Errore critico:', error)
    throw error
  }
}

// ✅ ASSEGNA BADGE PER LIVELLO COMPLETATO
async function assignBadgeForLevel(
  supabase: any,
  userId: string,
  moduleId: string,
  gameLevel: number
) {
  console.log(`[Assign Badge] Verifica badge per livello ${gameLevel}`)
  
  try {
    const badgeMap: Record<number, string> = {
      1: 'legal_tender',
      2: 'emoney_expert',
      3: 'risk_checker',
      4: 'fx_aware',
      5: 'anti_fraud'
    }
    
    const badgeCode = badgeMap[gameLevel]
    if (!badgeCode) {
      console.warn(`[Assign Badge] Nessun badge mappato per livello ${gameLevel}`)
      return null
    }
    
    // Cerca badge nel database
    const { data: badge, error: badgeError } = await supabase
      .from('module_internal_badges')
      .select('id, badge_code')
      .eq('module_id', moduleId)
      .eq('badge_code', badgeCode)
      .single()
    
    if (badgeError || !badge) {
      console.error(`[Assign Badge] Badge ${badgeCode} non trovato:`, badgeError)
      return null
    }
    
    // Controlla se esiste già
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .single()
    
    if (existingBadge) {
      console.log(`[Assign Badge] Utente ha già il badge ${badgeCode}`)
      return { ...badge, already_owned: true }
    }
    
    // Assegna nuovo badge
    const { data: newBadge, error: assignError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badge.id,
        module_id: moduleId,
        unlocked_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (assignError) {
      console.error(`[Assign Badge] Errore assegnazione:`, assignError)
      return null
    }
    
    console.log(`[Assign Badge] Badge ${badgeCode} assegnato con successo`)
    return { ...badge, ...newBadge }
  } catch (error) {
    console.error('[Assign Badge] Errore critico:', error)
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  console.log(`[API Complete] Ricevuta richiesta per modulo: ${params.moduleId}`)
  
  try {
    const moduleId = params.moduleId
    const supabase = createClient()
    
    // 1. Validazione input
    const body = await request.json()
    console.log('[API Complete] Body ricevuto:', JSON.stringify(body, null, 2))
    
    const validationResult = CompleteModuleSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.error('[API Complete] Validazione fallita:', validationResult.error.issues)
      return NextResponse.json(
        { 
          success: false,
          error: 'Dati non validi',
          details: validationResult.error.issues,
          tip: 'Controlla: 1) userId è stringa semplice, 2) answers è obbligatorio per diagnostic_completed'
        },
        { status: 400 }
      )
    }
    
    const { 
      score, 
      status, 
      answers, 
      scenarioId, 
      gameLevel, 
      timeSpent, 
      unlockedBadges,
      userId: bodyUserId 
    } = validationResult.data
    
    // 2. Ottieni sessione utente (per ambiente reale)
    const { data: { session } } = await supabase.auth.getSession()
    
    // ✅ DETERMINA USER ID (session prima, poi body per testing)
    let userId: string
    
    if (session?.user?.id) {
      userId = session.user.id
      console.log('[API Complete] User ID da sessione:', userId)
    } else if (bodyUserId) {
      userId = bodyUserId
      console.log('[API Complete] User ID da body (testing):', userId)
    } else {
      console.warn('[API Complete] Nessun userId fornito e nessuna sessione')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Autenticazione richiesta o userId mancante',
          tip: 'Fornisci un userId nel body per testing senza autenticazione'
        },
        { status: 401 }
      )
    }
    
    console.log(`[API Complete] Elaborazione: User=${userId}, Status=${status}, Score=${score}`)
    
    // 3. LOGICA PER OGNI STATO
    let knowledgeGaps: string[] = []
    let assignedLevels: number[] = []
    let savedAnswers = null
    let assignedBadge = null
    
    switch (status) {
      case 'diagnostic_completed':
        console.log('[API Complete] Elaborazione test diagnostico...')
        
        if (answers && answers.length > 0) {
          console.log(`[API Complete] Salvando ${answers.length} risposte diagnostiche`)
          savedAnswers = await saveTestAnswers(supabase, userId, moduleId, answers, 'diagnostic')
        }
        
        if (answers) {
          console.log('[API Complete] Avvio analisi lacune...')
          const analysis = analyzeKnowledgeGaps(answers)
          knowledgeGaps = analysis.gaps
          assignedLevels = analysis.assignedLevels
          console.log('[API Complete] Analisi completata:', { knowledgeGaps, assignedLevels })
        }
        break
        
      case 'level_completed':
        console.log(`[API Complete] Elaborazione completamento livello ${gameLevel}`)
        
        if (gameLevel) {
          assignedBadge = await assignBadgeForLevel(supabase, userId, moduleId, gameLevel)
          console.log(`[API Complete] Risultato badge:`, assignedBadge)
        }
        break
        
      case 'scenario_completed':
        console.log(`[API Complete] Scenario ${scenarioId} completato`)
        break
        
      case 'module_completed':
        console.log('[API Complete] Elaborazione test finale...')
        
        if (answers && answers.length > 0) {
          savedAnswers = await saveTestAnswers(supabase, userId, moduleId, answers, 'final')
        }
        
        // Logica micro-ripasso se score < 60%
        if (score < 60) {
          console.log(`[API Complete] Score finale ${score} < 60% → micro-ripasso necessario`)
        }
        break
    }
    
    // 4. PREPARA DATI PER IL DATABASE
    const progressData: any = {
      user_id: userId,
      module_id: moduleId,
      status: status === 'module_completed' ? 'completed' : 'in_progress',
      score: score,
      time_spent: timeSpent || 0,
      updated_at: new Date().toISOString()
    }
    
    // Aggiungi campi per analisi lacune
    if (knowledgeGaps.length > 0) {
      progressData.knowledge_gaps = knowledgeGaps
    }
    
    if (assignedLevels.length > 0) {
      progressData.assigned_levels = assignedLevels
      progressData.current_level = assignedLevels[0] // Inizia dal primo livello assegnato
    }
    
    // Gestione livelli completati
    if (gameLevel) {
      progressData.current_level = gameLevel
      
      // Recupera livelli già completati
      const { data: currentProgress } = await supabase
        .from('user_module_progress')
        .select('levels_completed')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single()
      
      const completedLevels = currentProgress?.levels_completed || []
      if (!completedLevels.includes(gameLevel)) {
        completedLevels.push(gameLevel)
        progressData.levels_completed = completedLevels
      }
    }
    
    // Punteggi specifici
    if (status === 'diagnostic_completed') {
      progressData.diagnostic_score = score
    }
    
    if (status === 'module_completed') {
      progressData.final_score = score
      progressData.completed_at = new Date().toISOString()
    }
    
    console.log('[API Complete] Dati progresso preparati:', progressData)
    
    // 5. SALVA NEL DATABASE
    console.log('[API Complete] Salvataggio nel database...')
    const { data: savedProgress, error: saveError } = await supabase
      .from('user_module_progress')
      .upsert(progressData, {
        onConflict: 'user_id,module_id'
      })
      .select()
      .single()
    
    if (saveError) {
      console.error('[API Complete] Errore salvataggio progresso:', saveError)
      // Continua comunque per non bloccare l'utente
    } else {
      console.log('[API Complete] Progresso salvato con ID:', savedProgress?.id)
    }
    
    // 6. PREPARA RISPOSTA
    const responseData = {
      success: true,
      message: getStatusMessage(status),
      data: {
        progress: savedProgress || progressData,
        analysis: {
          knowledgeGaps,
          assignedLevels,
          diagnosticScore: status === 'diagnostic_completed' ? score : undefined,
          finalScore: status === 'module_completed' ? score : undefined
        },
        badges: assignedBadge ? [assignedBadge] : [],
        nextAction: getNextAction(status, score, assignedLevels)
      },
      metadata: {
        userId,
        moduleId,
        timestamp: new Date().toISOString(),
        answersSaved: savedAnswers ? true : false
      }
    }
    
    console.log('[API Complete] Invio risposta:', responseData)
    
    return NextResponse.json(responseData, { status: 200 })
    
  } catch (error: any) {
    console.error('[API Complete] Errore critico:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore interno del server',
        message: error?.message || 'Errore sconosciuto',
        tip: 'Controlla la console del server per dettagli'
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    'diagnostic_completed': 'Test diagnostico completato. Analisi lacune eseguita.',
    'level_completed': 'Livello gamification completato. Ottimo lavoro!',
    'scenario_completed': 'Scenario completato con successo.',
    'module_completed': 'Modulo completato! Verifica dell\'apprendimento effettuata.'
  }
  return messages[status] || 'Operazione completata'
}

function getNextAction(status: string, score: number, assignedLevels: number[]): string {
  switch (status) {
    case 'diagnostic_completed':
      return assignedLevels.length > 0 
        ? `Procedi con il livello ${assignedLevels[0]} di gamification` 
        : 'Procedi con tutti i livelli di gamification'
    
    case 'level_completed':
      return 'Continua con il prossimo scenario o livello'
    
    case 'module_completed':
      return score < 60 
        ? 'Sono necessari rinforzi mirati. Vai alla sezione di micro-ripasso.' 
        : 'Competenza acquisita! Puoi procedere al modulo successivo.'
    
    default:
      return 'Continua il percorso formativo'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const supabase = createClient()
    const moduleId = params.moduleId
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId richiesto nei query params' },
        { status: 400 }
      )
    }
    
    const { data: progress, error } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single()
    
    if (error && error.code === 'PGRST116') {
      return NextResponse.json({
        exists: false,
        message: 'Nessun progresso trovato per questo utente e modulo',
        suggestedAction: 'Inizia il test diagnostico'
      })
    }
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      exists: true,
      progress: progress
    })
    
  } catch (error) {
    console.error('[API Complete GET] Errore:', error)
    return NextResponse.json(
      { success: false, error: 'Errore recupero dati' },
      { status: 500 }
    )
  }
}