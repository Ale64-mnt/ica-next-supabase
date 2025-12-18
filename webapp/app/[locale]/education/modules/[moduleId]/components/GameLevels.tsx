'use client';

interface GameLevelsProps {
  moduleId: string;
  scenarios?: any[];
  progress?: any;
}

export default function GameLevels({ moduleId, scenarios = [], progress }: GameLevelsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Livelli Gamificati</h3>
      <p className="text-gray-600">
        {scenarios.length > 0 
          ? `Sono disponibili ${scenarios.length} scenari per questo modulo.`
          : 'Nessuno scenario disponibile al momento.'}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="border rounded-lg p-4 bg-white shadow">
            <h4 className="font-bold">Livello {level}</h4>
            <p className="text-sm text-gray-600">4 scenari pratici</p>
            <button className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
              {progress?.completed_levels?.includes(level) ? '✓ Completato' : 'Inizia'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}