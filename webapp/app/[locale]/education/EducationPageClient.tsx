// File: app/[locale]/education/EducationPageClient.tsx - VERSIONE WCAG 2.1 AA
'use client';

import { useTranslations } from 'next-intl';
import { GlobalDashboard } from '@/app/components/education/GlobalDashboard';
import MacroAreasGrid from '@/app/components/education/MacroAreasGrid';
import { ArrowRight, Trophy, Target, TrendingUp, BookOpen, Star } from 'lucide-react';

interface EducationPageClientProps {
  params: { locale: string };
  dashboardData: {
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
  };
}

export default function EducationPageClient({ 
  params, 
  dashboardData 
}: EducationPageClientProps) {
  const { locale } = params;
  const t = useTranslations('Education');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Header con breadcrumb semantico */}
      <header aria-labelledby="page-title">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-700">
            <li><a href={`/${locale}`} className="hover:text-blue-700 hover:underline">Home</a></li>
            <li><span className="text-gray-500">/</span></li>
            <li aria-current="page" className="font-semibold text-gray-900">Educazione Finanziaria</li>
          </ol>
        </nav>
        
        <h1 id="page-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('title')}
        </h1>
        <p className="text-lg text-gray-700">
          {t('subtitle')}
        </p>
      </header>

      {/* Sezione Saluto Utente */}
      <section aria-labelledby="user-welcome" className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 id="user-welcome" className="text-xl font-semibold text-gray-900 mb-2">
              Benvenuto, Studente!
            </h2>
            <p className="text-gray-700">
              Hai <span className="font-bold text-blue-700">{dashboardData.stats.completedModules}</span> moduli completati 
              e <span className="font-bold text-blue-700">{dashboardData.stats.acquiredCompetencies}</span> competenze acquisite.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-700">Online - Pronto ad apprendere</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Accessibile */}
      <section aria-labelledby="dashboard-title">
        <div className="flex items-center justify-between mb-6">
          <h2 id="dashboard-title" className="text-2xl font-bold text-gray-900">
            Il Tuo Progresso
          </h2>
          <button 
            className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
            aria-label="Aggiorna statistiche"
          >
            <span>Aggiorna</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        <GlobalDashboard 
          stats={dashboardData.stats}
          areas={dashboardData.areas}
        />
      </section>

      {/* Sezione Aree di Apprendimento - Accessibile */}
      <section aria-labelledby="learning-areas-title">
        <div className="mb-6">
          <h2 id="learning-areas-title" className="text-2xl font-bold text-gray-900 mb-2">
            {t('learning_areas')}
          </h2>
          <p className="text-gray-700">
            Scegli un&apos;area per iniziare il tuo percorso di apprendimento
          </p>
        </div>

        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
          <MacroAreasGrid />
        </div>
      </section>

      {/* Moduli Consigliati - Accessibile */}
      <section aria-labelledby="recommended-modules">
        <h2 id="recommended-modules" className="text-2xl font-bold text-gray-900 mb-6">
          Consigliati per Te
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Alto contrasto */}
          <article className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg" aria-hidden="true">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Valuta Estera e Cambio
                </h3>
                <p className="text-sm text-gray-700">
                  Area: Denaro e Transazioni
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Impara a calcolare importi in valuta estera e conoscere i fornitori di servizi di cambio
            </p>
            <button 
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Inizia il modulo Valuta Estera e Cambio"
            >
              Inizia Apprendimento
            </button>
          </article>

          {/* Card 2 */}
          <article className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-green-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg" aria-hidden="true">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Creazione Budget Personale
                </h3>
                <p className="text-sm text-gray-700">
                  Area: Pianificazione e Budgeting
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Scopri come pianificare le tue spese e gestire il budget in modo efficace
            </p>
            <button 
              className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Inizia il modulo Creazione Budget Personale"
            >
              Inizia Apprendimento
            </button>
          </article>

          {/* Card 3 */}
          <article className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-red-500">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg" aria-hidden="true">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  Fondamenti di Assicurazione
                </h3>
                <p className="text-sm text-gray-700">
                  Area: Gestione Rischi
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Comprendi i rischi finanziari e come proteggerti con le assicurazioni
            </p>
            <button 
              className="w-full bg-red-700 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Inizia il modulo Fondamenti di Assicurazione"
            >
              Inizia Apprendimento
            </button>
          </article>
        </div>
      </section>

      {/* Sezione Obiettivi - Accessibile */}
      <section aria-labelledby="learning-goals" className="bg-gray-50 border border-gray-300 rounded-xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="lg:w-2/3">
            <h2 id="learning-goals" className="text-2xl font-bold text-gray-900 mb-6">
              I Tuoi Prossimi Obiettivi
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-600 rounded-full" aria-hidden="true"></div>
                <span className="text-gray-900">
                  Completa il modulo &quot;Valuta Estera&quot; per sbloccare il badge <strong className="font-semibold">Calcolo Valute</strong>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-600 rounded-full" aria-hidden="true"></div>
                <span className="text-gray-900">
                  Raggiungi 3 giorni consecutivi di apprendimento per il badge <strong className="font-semibold">Dedizione</strong>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-600 rounded-full" aria-hidden="true"></div>
                <span className="text-gray-900">
                  Completa 5 moduli nell&apos;area Denaro per sbloccare il badge <strong className="font-semibold">Esperto in Transazioni</strong>
                </span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-3">Prossimo Traguardo</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Badge Calcolo Valute</p>
                  <p className="text-sm text-gray-700">Disponibile tra 1 modulo</p>
                </div>
              </div>
              <button 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                aria-label="Visualizza tutti gli obiettivi di apprendimento"
              >
                Vedi tutti gli obiettivi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Link di navigazione accessibile */}
      <nav aria-label="Navigazione educazione" className="border-t border-gray-300 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href={`/${locale}/education/dashboard`}
            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors focus:ring-2 focus:ring-blue-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Dashboard Dettagliata</h3>
            <p className="text-sm text-gray-700">Vedi statistiche avanzate e report</p>
          </a>
          
          <a 
            href={`/${locale}/education/achievements`}
            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors focus:ring-2 focus:ring-blue-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">I Tuoi Badge</h3>
            <p className="text-sm text-gray-700">Collezione completa dei tuoi achievement</p>
          </a>
          
          <a 
            href={`/${locale}/education/settings`}
            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors focus:ring-2 focus:ring-blue-500"
          >
            <h3 className="font-semibold text-gray-900 mb-1">Impostazioni Apprendimento</h3>
            <p className="text-sm text-gray-700">Personalizza il tuo percorso</p>
          </a>
        </div>
      </nav>
    </div>
  );
}