// File: app/components/education/GlobalDashboard.tsx - VERSIONE WCAG 2.1 AA
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { ShadcnCard as Card, CardHeader, CardTitle, CardContent } from '@/components/ui/ShadcnCard';
import { Trophy, Target, TrendingUp, BookOpen, Award, Clock } from 'lucide-react';

interface GlobalDashboardProps {
  stats: {
    totalModules: number;
    completedModules: number;
    totalCompetencies: number;
    acquiredCompetencies: number;
    badgesUnlocked: number;
    totalBadges: number;
    learningStreak: number;
    timeSpent: string;
  };
  areas: Array<{
    id: string;
    nameKey: string;
    title: string;
    color: string;
    icon: string;
    totalModules: number;
    completedModules: number;
    totalCompetencies: number;
    acquiredCompetencies: number;
  }>;
}

export function GlobalDashboard({ stats, areas }: GlobalDashboardProps) {
  const t = useTranslations('education.dashboard');

  return (
    <div className="space-y-8">
      {/* SEZIONE 1: Statistiche Globali */}
      <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-700 dark:text-yellow-300" aria-hidden="true" />
            </div>
            <span className="text-gray-900 dark:text-white">
              {t('yourLearningJourney')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              title={t('modulesCompleted')}
              value={`${stats.completedModules}/${stats.totalModules}`}
              percentage={stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0}
              color="blue"
            />
            
            <StatCard
              icon={<Target className="h-5 w-5" />}
              title={t('competenciesAcquired')}
              value={`${stats.acquiredCompetencies}/${stats.totalCompetencies}`}
              percentage={stats.totalCompetencies > 0 ? Math.round((stats.acquiredCompetencies / stats.totalCompetencies) * 100) : 0}
              color="purple"
            />
            
            <StatCard
              icon={<Award className="h-5 w-5" />}
              title={t('badgesUnlocked')}
              value={`${stats.badgesUnlocked}/${stats.totalBadges}`}
              percentage={stats.totalBadges > 0 ? Math.round((stats.badgesUnlocked / stats.totalBadges) * 100) : 0}
              color="green"
            />
            
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              title={t('learningStreak')}
              value={`${stats.learningStreak} giorni`}
              subtitle={t('timeSpent', { time: stats.timeSpent })}
              percentage={Math.min(stats.learningStreak * 10, 100)}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEZIONE 2: Progresso per Area */}
      {areas.length > 0 && (
        <Card className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              {t('progressByArea')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {areas.map((area) => {
                const moduleProgress = area.totalModules > 0 
                  ? Math.round((area.completedModules / area.totalModules) * 100) 
                  : 0;
                
                const competencyProgress = area.totalCompetencies > 0
                  ? Math.round((area.acquiredCompetencies / area.totalCompetencies) * 100)
                  : 0;

                return (
                  <AreaProgressCard
                    key={area.id}
                    area={area}
                    moduleProgress={moduleProgress}
                    competencyProgress={competencyProgress}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEZIONE 3: Badge Collection */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center justify-between">
            <span>{t('badgeCollection')}</span>
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              {stats.badgesUnlocked}/{stats.totalBadges}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 justify-center">
            {/* Badge sbloccati */}
            {Array.from({ length: Math.min(stats.badgesUnlocked, 6) }).map((_, i) => (
              <div key={`unlocked-${i}`} className="flex flex-col items-center">
                <div 
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  aria-label={`Badge ${i + 1} sbloccato`}
                  role="img"
                >
                  {i + 1}
                </div>
                <span className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                  Badge {i + 1}
                </span>
              </div>
            ))}
            
            {/* Badge bloccati */}
            {Array.from({ length: Math.max(0, 6 - stats.badgesUnlocked) }).map((_, i) => (
              <div key={`locked-${i}`} className="flex flex-col items-center opacity-70">
                <div 
                  className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shadow"
                  aria-label={`Badge ${stats.badgesUnlocked + i + 1} bloccato`}
                  role="img"
                >
                  <span className="text-2xl text-gray-500 dark:text-gray-400">?</span>
                </div>
                <span className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {t('locked')}
                </span>
              </div>
            ))}
          </div>
          
          {stats.badgesUnlocked > 0 && (
            <div className="mt-8 text-center">
              <button 
                className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-base px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Visualizza tutti i badge"
              >
                {t('viewAllBadges')} →
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente StatCard con contrasto WCAG 2.1 AA
function StatCard({ 
  icon, 
  title, 
  value, 
  percentage, 
  subtitle,
  color 
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  percentage: number;
  subtitle?: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  const progressColors = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-300 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`} aria-hidden="true">
          {icon}
        </div>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
      
      <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h3>
      
      {subtitle && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          {subtitle}
        </p>
      )}
      
      <div className="space-y-2">
        <ProgressBar 
          value={percentage} 
          max={100} 
          className="h-3"
          color={progressColors[color]}
        />
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progresso
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente AreaProgressCard con contrasto WCAG 2.1 AA
function AreaProgressCard({ 
  area, 
  moduleProgress, 
  competencyProgress 
}: {
  area: GlobalDashboardProps['areas'][0];
  moduleProgress: number;
  competencyProgress: number;
}) {
  const t = useTranslations('education.dashboard');

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'bg-blue-500': 'bg-blue-600 dark:bg-blue-700',
      'bg-green-500': 'bg-green-600 dark:bg-green-700',
      'bg-red-500': 'bg-red-600 dark:bg-red-700',
      'bg-purple-500': 'bg-purple-600 dark:bg-purple-700',
      'bg-orange-500': 'bg-orange-600 dark:bg-orange-700',
    };
    return colorMap[color] || 'bg-blue-600 dark:bg-blue-700';
  };

  return (
    <div className={`
      bg-white dark:bg-gray-900
      border rounded-xl p-5 
      hover:shadow-lg transition-all duration-300
      cursor-pointer
      border-gray-300 dark:border-gray-700
      ${area.completedModules > 0 ? 
        'hover:border-blue-400 dark:hover:border-blue-500' : 
        'hover:border-gray-400 dark:hover:border-gray-600'
      }
    `}
    role="button"
    tabIndex={0}
    aria-label={`Vai all'area ${area.title}, completato ${area.completedModules} di ${area.totalModules} moduli`}
    >
      <div className="flex items-center gap-4 mb-5">
        <div className={`p-3 rounded-xl ${getColorClass(area.color)} text-white`}>
          <span className="text-xl" aria-hidden="true">{area.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {area.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {area.completedModules}/{area.totalModules} {t('modules')}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-800 dark:text-gray-300">
              {t('modules')}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {moduleProgress}%
            </span>
          </div>
          <ProgressBar 
            value={moduleProgress} 
            max={100} 
            className="h-2.5"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-800 dark:text-gray-300">
              {t('competencies')}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {competencyProgress}%
            </span>
          </div>
          <ProgressBar 
            value={competencyProgress} 
            max={100} 
            className="h-2.5 bg-purple-100 dark:bg-purple-900"
            color="bg-purple-600"
          />
        </div>
      </div>
      
      <button 
        className="mt-6 w-full py-2.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Esplora area ${area.title}`}
      >
        {t('exploreArea')} →
      </button>
    </div>
  );
}