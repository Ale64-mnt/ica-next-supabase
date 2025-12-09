// File: app/components/education/ModuleCompletionButton.tsx
'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ModuleCompletionButtonProps {
  moduleId: string;
  moduleTitle: string;
  onComplete?: (data: any) => void;
  className?: string;
  initialProgress?: number;
}

const ModuleCompletionButton: React.FC<ModuleCompletionButtonProps> = ({
  moduleId,
  moduleTitle,
  onComplete,
  className = '',
  initialProgress = 0
}) => {
  const t = useTranslations('education');
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/education/modules/${moduleId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress: 100,
          timeSpent: 30, // minuti stimati
          score: 95
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel completamento');
      }

      const data = await response.json();
      setCompleted(true);
      setProgress(100);
      onComplete?.(data);
      
    } catch (error) {
      console.error('Errore:', error);
      alert(t('completionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra di progresso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {t('progress')}: {progress}%
          </span>
          <span className="text-gray-500">
            {moduleTitle}
          </span>
        </div>
        
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Pulsanti */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleProgressChange(progress + 25)}
          disabled={progress >= 100 || loading}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          +25%
        </button>
        
        <button
          onClick={() => handleProgressChange(progress - 25)}
          disabled={progress <= 0 || loading}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          -25%
        </button>

        <button
          onClick={handleComplete}
          disabled={loading || completed}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {t('completing')}...
            </>
          ) : completed ? (
            <>
              <span>✓</span>
              {t('completed')}
            </>
          ) : (
            <>
              <span>✓</span>
              {t('completeModule')}
            </>
          )}
        </button>
      </div>

      {/* Info aggiuntive */}
      {completed && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 text-sm">
            {t('moduleCompletedMessage')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModuleCompletionButton;