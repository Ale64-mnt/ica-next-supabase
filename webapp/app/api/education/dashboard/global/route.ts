// File: app/api/education/dashboard/global/route.ts
// RENDI DINAMICA
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';



export async function GET() {
  try {
    const supabase = await createClient();
    
    // Verifica se siamo in build
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json(getMockData());
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Per build, ritorna dati mock
      return NextResponse.json(getMockData());
    }
    
    // Fetch dati reali...
    const stats = await getStats(supabase, user.id);
    const areas = await getAreas(supabase, user.id);
    
    return NextResponse.json({ stats, areas });
    
  } catch (error) {
    console.error('Error fetching global dashboard:', error);
    return NextResponse.json(getMockData());
  }
}

function getMockData() {
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
        title: 'Money and Transactions',
        color: 'bg-blue-500',
        icon: '💰',
        totalModules: 8,
        completedModules: 2,
        totalCompetencies: 16,
        acquiredCompetencies: 4
      },
      // ... altre aree mock
    ]
  };
}

// Helper functions per fetch reali
async function getStats(supabase: any, userId: string) {
  // Implementa la logica reale qui
  return getMockData().stats;
}

async function getAreas(supabase: any, userId: string) {
  // Implementa la logica reale qui
  return getMockData().areas;
}