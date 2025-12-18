'use client';

interface ModuleProgressProps {
  status: string;
  progress?: any;
  moduleId: string;
}

export default function ModuleProgress({ status, progress, moduleId }: ModuleProgressProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'not_started':
        return { 
          label: 'Non Iniziato', 
          color: 'bg-gray-300 dark:bg-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          percentage: 0,
          steps: ['Test Diagnostico', 'Livelli Gamificati', 'Test Finale']
        };
      case 'diagnostic_completed':
        return { 
          label: 'Test Completato', 
          color: 'bg-blue-500 dark:bg-blue-600',
          textColor: 'text-blue-700 dark:text-blue-300',
          percentage: 33,
          steps: [' Test Diagnostico', 'Livelli Gamificati', 'Test Finale']
        };
      case 'levels_completed':
        return { 
          label: 'Livelli Completati', 
          color: 'bg-yellow-500 dark:bg-yellow-600',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          percentage: 66,
          steps: [' Test Diagnostico', ' Livelli Gamificati', 'Test Finale']
        };
      case 'completed':
        return { 
          label: 'Modulo Completato', 
          color: 'bg-green-500 dark:bg-green-600',
          textColor: 'text-green-700 dark:text-green-300',
          percentage: 100,
          steps: [' Test Diagnostico', ' Livelli Gamificati', ' Test Finale']
        };
      default:
        return { 
          label: 'In Corso', 
          color: 'bg-gray-400 dark:bg-gray-600',
          textColor: 'text-gray-600 dark:text-gray-400',
          percentage: 0,
          steps: ['Test Diagnostico', 'Livelli Gamificati', 'Test Finale']
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.textColor} ${statusInfo.color.replace('bg-', 'bg-opacity-20 dark:bg-opacity-20 ')}`}>
            {statusInfo.label}
          </span>
          {progress?.diagnostic_score !== undefined && (
            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              Punteggio test: <strong>{progress.diagnostic_score}/100</strong>
            </span>
          )}
        </div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {statusInfo.percentage}%
        </div>
      </div>
      
      {/* Barra di progresso */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
        <div 
          className={`${statusInfo.color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${statusInfo.percentage}%` }}
        ></div>
      </div>
      
      {/* Step indicator */}
      <div className="flex justify-between mt-4">
        {statusInfo.steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center w-1/3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
              ${step.startsWith('') 
                ? 'bg-green-500 text-white' 
                : index * 33 <= statusInfo.percentage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
              {step.startsWith('') ? '' : index + 1}
            </div>
            <span className={`text-xs text-center ${step.startsWith('') 
              ? 'text-green-600 dark:text-green-400 font-medium' 
              : 'text-gray-600 dark:text-gray-400'}`}>
              {step.replace(' ', '')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
