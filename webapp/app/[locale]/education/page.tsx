// File: app/[locale]/education/page.tsx (SERVER COMPONENT)
import { getGlobalDashboardData } from '@/app/lib/api/education/dashboard';
import EducationPageClient from './EducationPageClient';
import { notFound } from 'next/navigation';

interface EducationPageProps {
  params: {
    locale: string;
  };
}

export default async function EducationPage({ params }: EducationPageProps) {
  const { locale } = params;
  
  // Verifica locale valido
  const validLocales = ['it', 'en', 'fr', 'de', 'es'];
  if (!validLocales.includes(locale)) {
    notFound();
  }
  
  try {
    // Fetch dati dal server
    const dashboardData = await getGlobalDashboardData();
    
    return <EducationPageClient params={params} dashboardData={dashboardData} />;
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Fallback a dati mock se l'API non è pronta
    const mockData = {
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
          id: 'planning_budgeting',
          nameKey: 'planning_budgeting',
          title: 'Pianificazione e Budgeting',
          color: 'bg-green-500',
          icon: '📊',
          totalModules: 6,
          completedModules: 1,
          totalCompetencies: 12,
          acquiredCompetencies: 2
        },
        {
          id: 'managing_risks_insurance',
          nameKey: 'managing_risks_insurance',
          title: 'Gestione Rischi e Assicurazioni',
          color: 'bg-red-500',
          icon: '⚠️',
          totalModules: 5,
          completedModules: 1,
          totalCompetencies: 10,
          acquiredCompetencies: 1
        },
        {
          id: 'financial_landscape',
          nameKey: 'financial_landscape',
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
    
    return <EducationPageClient params={params} dashboardData={mockData} />;
  }
}