
// File: app/components/education/ProgressDualView.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface ProgressDualViewProps {
  className?: string;
  showDetails?: boolean;
}

const ProgressDualView: React.FC<ProgressDualViewProps> = ({ 
  className = '', 
  showDetails = true 
}) => {
  const t = useTranslations('education.progress');
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {t('yourProgress')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {t('progressDescription')}
          </p>
        </div>
      </div>

      {/* Progresso Reale */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              {t('realProgress')}
            </h3>
          </div>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            33%
          </span>
        </div>
        
        <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 w-1/3"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-white mix-blend-difference">
              2/6 {t('modules')}
            </span>
          </div>
        </div>
        
        {showDetails && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('realProgressDescription', { 
              completed: 2,
              total: 6 
            })}
          </p>
        )}
      </div>

      {/* Progresso Potenziale */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              {t('potentialProgress')}
            </h3>
          </div>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            67%
          </span>
        </div>
        
        <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 w-2/3"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-800 dark:text-white mix-blend-difference">
              2/3 {t('competencies')}
            </span>
          </div>
        </div>
        
        {showDetails && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {t('potentialProgressDescription', {
              completed: 2,
              total: 3
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressDualView;
