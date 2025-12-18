import { getModuleById, getModuleProgress, getModuleScenarios } from '@/app/lib/api/education';
import DiagnosticTest from './components/DiagnosticTest';
import GameLevels from './components/GameLevels';
import FinalTest from './components/FinalTest';
import ModuleProgress from './components/ModuleProgress';

interface PageProps {
  params: {
    locale: string;
    moduleId: string;  // Corretto: torna a moduleId
  };
}

export default async function ModulePage({ params }: PageProps) {
  // Fetch moduli dati
  const moduleData = await getModuleById(params.moduleId, params.locale);
  const scenarios = await getModuleScenarios(params.moduleId, params.locale);
  const progress = await getModuleProgress(params.moduleId);
  
  // Stato del modulo (non iniziato, in corso, completato)
  const moduleStatus = progress?.status || 'not_started';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header del modulo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {moduleData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {moduleData.description}
        </p>
        
        {/* Competenze EU collegate */}
        {moduleData.competencies && moduleData.competencies.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Competenze Europee
            </h3>
            <div className="flex flex-wrap gap-2">
              {moduleData.competencies.map((comp: any) => (
                <span 
                  key={comp.id}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {comp.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progresso modulo */}
      <ModuleProgress 
        status={moduleStatus} 
        progress={progress}
        moduleId={params.moduleId}
      />

      {/* Contenuto in base allo stato */}
      {moduleStatus === 'not_started' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Test Diagnostico
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Completa il test iniziale (20 domande, 25 minuti) per identificare le tue lacune 
            e ricevere un percorso personalizzato.
          </p>
          <DiagnosticTest 
            moduleId={params.moduleId}
            locale={params.locale}
          />
        </div>
      )}

      {moduleStatus === 'diagnostic_completed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Percorso Gamificato
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Basato sul tuo test, ecco i livelli da completare. Ogni livello contiene 4 scenari 
            pratici con feedback immediato.
          </p>
          <GameLevels 
            moduleId={params.moduleId}
            scenarios={scenarios}
            progress={progress}
          />
        </div>
      )}

      {moduleStatus === 'levels_completed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Test Finale
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Verifica le competenze acquisite con questo test finale (20 minuti). 
            Sblocca il badge del modulo al raggiungimento dell`&apos;`80%.
          </p>
          <FinalTest 
            moduleId={params.moduleId}
            locale={params.locale}
            initialScore={progress?.diagnostic_score}
          />
        </div>
      )}

      {moduleStatus === 'completed' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Modulo Completato!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Hai completato con successo il modulo <strong>{moduleData.title}</strong>
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              Punteggio finale: {progress?.final_score}/100
            </div>
          </div>
          
          {/* Badge sbloccati */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Badge Sbloccati
            </h3>
            <div className="flex justify-center gap-4">
              {/* Qui verranno mostrati i badge interni sbloccati */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}