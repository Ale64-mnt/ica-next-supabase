// app/[locale]/education/modules/[moduleId]/page.tsx
import { getModuleById, getModuleQuestions } from '@/app/lib/api/education';
import DiagnosticTest from '@/app/components/education/DiagnosticTest/DiagnosticTest';
import GameLevels from '@/app/components/education/GameLevels/GameLevels';
import ModuleProgress from '@/app/components/education/ModuleProgress/ModuleProgress';
import FinalTest from '@/app/components/education/FinalTest/FinalTest';
import { createClient } from '@/app/lib/supabase/server';
import { Suspense } from 'react';

async function getCurrentUser() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded mb-8"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default async function ModulePage({ 
  params 
}: { 
  params: { 
    locale: string;
    moduleId: string;
  } 
}) {
  const moduleData = await getModuleById(params.moduleId, params.locale);
  const user = await getCurrentUser();
  const userId = user?.id;

  // Ottieni le domande per i test
  const diagnosticQuestions = await getModuleQuestions(
    params.moduleId, 
    'diagnostic',
    params.locale
  );
  
  const finalQuestions = await getModuleQuestions(
    params.moduleId, 
    'final',
    params.locale
  );

  if (!moduleData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Modulo non trovato</h1>
        <p className="text-gray-600">
          Il modulo con ID <code className="bg-gray-100 px-2 py-1 rounded">{params.moduleId}</code> non esiste nel database.
        </p>
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-semibold text-yellow-800">Per testare il Modulo A:</p>
          <p className="text-yellow-700 mt-2">
            Visita: <code className="bg-yellow-100 px-2 py-1 rounded">/education/modules/4e0045e9-7e21-492d-a479-c400425a069d</code>
          </p>
        </div>
      </div>
    );
  }

  // Funzioni handler (solo quelle necessarie)
  const handleLevelsComplete = () => {
    console.log('Gamification completata!');
  };

  const handleFinalComplete = (score: number, certificateData?: any) => {
    console.log('Test finale completato con punteggio:', score);
    
    if (score >= 60) {
      console.log('✅ Certificato ottenuto! Soglia superata (≥60%)');
    } else {
      console.log('⚠️ Punteggio insufficiente (<60%), micro-ripasso consigliato');
    }
  };

  console.log(`📊 Modulo ${params.moduleId}:`);
  console.log(`  - Domande diagnostiche: ${diagnosticQuestions.length}/20`);
  console.log(`  - Domande finali: ${finalQuestions.length}/20`);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header del modulo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {moduleData.title_i18n?.[params.locale] || moduleData.title_i18n?.en || 'Modulo Educativo'}
        </h1>
        <p className="text-gray-600 mb-6">
          {moduleData.description_i18n?.[params.locale] || moduleData.description_i18n?.en || ''}
        </p>
        
        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <span className="mr-2">📚</span>
          Modulo {moduleData.sort_order || 1} • {moduleData.estimated_duration_minutes || 90} min
          {diagnosticQuestions.length > 0 && finalQuestions.length > 0 && (
            <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              ✅ {diagnosticQuestions.length + finalQuestions.length} domande caricate
            </span>
          )}
        </div>
      </div>

      {/* Tracciamento progresso */}
      {userId ? (
        <div className="mb-8">
          <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse"></div>}>
            <ModuleProgress userId={userId} moduleId={params.moduleId} />
          </Suspense>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <span className="font-semibold">👤 Accedi</span> per salvare il tuo progresso, ottenere badge e certificati.
          </p>
        </div>
      )}

      <div className="space-y-12">
        {/* Sezione 1: Test Diagnostico */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">1</span>
              </div>
              <h2 className="text-2xl font-bold">Test Diagnostico</h2>
              {diagnosticQuestions.length > 0 && (
                <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {diagnosticQuestions.length} domande
                </span>
              )}
            </div>
            <p className="text-gray-700 ml-11">
              Completa il test diagnostico per identificare le tue lacune di conoscenza.
              Il sistema analizzerà le tue risposte e creerà un percorso di apprendimento personalizzato.
            </p>
          </div>
          
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse"></div>}>
            {diagnosticQuestions.length > 0 ? (
              <DiagnosticTest 
                questions={diagnosticQuestions}
                moduleId={params.moduleId}
                locale={params.locale}
              />
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Caricamento domande diagnostiche...</p>
              </div>
            )}
          </Suspense>
        </section>

        {/* Sezione 2: Gamification */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">2</span>
              </div>
              <h2 className="text-2xl font-bold">Gamification</h2>
            </div>
            <p className="text-gray-700 ml-11">
              Basato sui risultati del test diagnostico, avrai accesso a 5 livelli gamificati
              specifici per le tue lacune di conoscenza.
            </p>
          </div>
          
          <Suspense fallback={<div className="h-48 bg-gray-100 rounded animate-pulse"></div>}>
            {userId ? (
              <GameLevels 
                moduleId={params.moduleId}
                userId={userId}
                locale={params.locale}
                onComplete={handleLevelsComplete}
              />
            ) : (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">🎮</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Gamification disponibile</h4>
                    <p className="text-green-700 mt-1">
                      Completa il test diagnostico per sbloccare i 5 livelli di gamification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </section>

        {/* Sezione 3: Test Finale */}
        <section className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">3</span>
              </div>
              <h2 className="text-2xl font-bold">Test Finale & Certificazione</h2>
              {finalQuestions.length > 0 && (
                <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {finalQuestions.length} domande
                </span>
              )}
            </div>
            <p className="text-gray-700 ml-11">
              Verifica il tuo apprendimento con il test finale. Supera la soglia del 60% per ottenere
              il certificato di completamento.
            </p>
          </div>
          
          <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse"></div>}>
            {userId ? (
              finalQuestions.length > 0 ? (
                <FinalTest 
                questions={finalQuestions}
                moduleId={params.moduleId}
                moduleName={moduleData.title_i18n?.[params.locale] || 'Modulo Educativo'}
                userId={userId}
                passingScore={60}
                  
                />
              ) : (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-purple-600 text-xl">📝</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Test finale pronto</h4>
                      <p className="text-purple-700 mt-1">
                        Completa i livelli di gamification per sbloccare il test finale.
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-amber-600 text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">Test finale bloccato</h4>
                    <p className="text-amber-700 mt-1">
                      Accedi al tuo account per sbloccare il test finale.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Suspense>
        </section>
      </div>

      {/* Footer informativo */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">💡</span> Competenze Europee
            </h3>
            <p className="text-gray-600 text-sm">
              Sviluppa competenze riconosciute nel framework europeo DigComp 2.2.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">🎯</span> Sistema di Badge
            </h3>
            <p className="text-gray-600 text-sm">
              5 badge tematici per certificare le competenze acquisite.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span> Tracciamento Progresso
            </h3>
            <p className="text-gray-600 text-sm">
              Tracciamento completo delle lacune, livelli e competenze sviluppate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}