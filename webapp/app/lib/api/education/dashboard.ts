// File: app/lib/api/education/dashboard.ts (fallback)
export async function getGlobalDashboardData() {
    // In produzione: fetch da API
    // In sviluppo: mock data
    
    return {
      stats: {
        totalModules: 24,
        completedModules: 5,
        totalCompetencies: 48,
        acquiredCompetencies: 8,
        badgesUnlocked: 3,
        totalBadges: 12,
        learningStreak: 7,
        timeSpent: '15h 30m'
      },
      areas: [
        {
          id: 'money_transactions',
          nameKey: 'money_transactions',
          title: 'Denaro e Transazioni',
          color: 'bg-blue-500',
          icon: '💰',
          totalModules: 8,
          completedModules: 2,
          totalCompetencies: 16,
          acquiredCompetencies: 4
        },
        {
          id: 'planning',
          nameKey: 'planning',
          title: 'Pianificazione Finanziaria',
          color: 'bg-green-500',
          icon: '📊',
          totalModules: 6,
          completedModules: 1,
          totalCompetencies: 12,
          acquiredCompetencies: 2
        },
        {
          id: 'risk',
          nameKey: 'risk',
          title: 'Rischio e Rendimento',
          color: 'bg-red-500',
          icon: '⚠️',
          totalModules: 5,
          completedModules: 1,
          totalCompetencies: 10,
          acquiredCompetencies: 1
        },
        {
          id: 'landscape',
          nameKey: 'landscape',
          title: 'Panorama Finanziario',
          color: 'bg-purple-500',
          icon: '🌍',
          totalModules: 5,
          completedModules: 1,
          totalCompetencies: 10,
          acquiredCompetencies: 1
        }
      ]
    };
  }