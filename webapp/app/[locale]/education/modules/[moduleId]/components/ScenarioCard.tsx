'use client';

interface ScenarioCardProps {
  scenario: {
    id: string;
    title: string;
    description: string;
    level_number: number;
    scenario_number: number;
    difficulty?: string;
    estimated_time?: number;
  };
  isCompleted?: boolean;
  onStart?: (scenarioId: string) => void;
}

export default function ScenarioCard({ scenario, isCompleted = false, onStart }: ScenarioCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'facile': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'difficile': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-5 transition-all hover:shadow-lg 
      ${isCompleted 
        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
      
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              L{scenario.level_number}.S{scenario.scenario_number}
            </span>
            {scenario.difficulty && (
              <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(scenario.difficulty)}`}>
                {scenario.difficulty}
              </span>
            )}
            {isCompleted && (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                 Completato
              </span>
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            {scenario.title}
          </h4>
        </div>
        
        {scenario.estimated_time && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
             {scenario.estimated_time} min
          </div>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {scenario.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Scenario pratico interattivo
        </div>
        
        <button
          onClick={() => onStart?.(scenario.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors
            ${isCompleted
              ? 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-800 dark:hover:bg-green-700 dark:text-green-200'
              : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'}`}
        >
          {isCompleted ? 'Rivedi' : 'Inizia'}
        </button>
      </div>
    </div>
  );
}
