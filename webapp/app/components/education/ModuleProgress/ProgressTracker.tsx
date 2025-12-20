"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Competency {
  id: string;
  name: string;
  description: string;
  level: number; // 1-3
  euFramework: string;
  color: string;
}

interface ProgressTrackerProps {
  moduleId: string;
  userId: string;
  acquiredCompetencies: string[];
}

// Mock EU Competencies
const EU_COMPETENCIES: Competency[] = [
  {
    id: "financial_literacy",
    name: "Alfabetizzazione Finanziaria",
    description: "Comprensione dei concetti finanziari di base",
    level: 1,
    euFramework: "EU DigComp 2.1",
    color: "bg-blue-100 text-blue-800"
  },
  {
    id: "digital_payments",
    name: "Pagamenti Digitali Sicuri",
    description: "Utilizzo sicuro dei sistemi di pagamento digitale",
    level: 2,
    euFramework: "EU DigComp 2.1",
    color: "bg-green-100 text-green-800"
  },
  {
    id: "fraud_prevention",
    name: "Prevenzione Frodi",
    description: "Riconoscimento e prevenzione delle frodi finanziarie",
    level: 3,
    euFramework: "EU DigComp 2.1",
    color: "bg-red-100 text-red-800"
  },
  {
    id: "budgeting",
    name: "Gestione Budget",
    description: "Creazione e gestione di un budget personale",
    level: 2,
    euFramework: "EU LifeComp",
    color: "bg-purple-100 text-purple-800"
  },
  {
    id: "financial_planning",
    name: "Pianificazione Finanziaria",
    description: "Pianificazione finanziaria a breve e lungo termine",
    level: 3,
    euFramework: "EU LifeComp",
    color: "bg-yellow-100 text-yellow-800"
  }
];

export default function ProgressTracker({
  moduleId,
  userId,
  acquiredCompetencies = []
}: ProgressTrackerProps) {
  const t = useTranslations("ModuleProgress");
  const [competencies, setCompetencies] = useState<Competency[]>(EU_COMPETENCIES);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadCompetencies();
  }, [moduleId, userId]);
  
  const loadCompetencies = async () => {
    setIsLoading(true);
    try {
      // TODO: Sostituire con chiamata API reale
      // const response = await fetch(`/api/education/modules/${moduleId}/competencies`);
      // const data = await response.json();
      
      // Usiamo i mock data per ora
      setCompetencies(EU_COMPETENCIES);
    } catch (error) {
      console.error("Error loading competencies:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLevelLabel = (level: number): string => {
    switch (level) {
      case 1: return t("level_basic");
      case 2: return t("level_intermediate");
      case 3: return t("level_advanced");
      default: return t("level_basic");
    }
  };
  
  const getLevelColor = (level: number): string => {
    switch (level) {
      case 1: return "bg-blue-500";
      case 2: return "bg-green-500";
      case 3: return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  
  const calculateOverallProgress = (): number => {
    if (competencies.length === 0) return 0;
    const totalLevels = competencies.reduce((sum, comp) => sum + comp.level, 0);
    const maxPossible = competencies.length * 3;
    return Math.round((totalLevels / maxPossible) * 100);
  };
  
  const getCompetencyProgress = (competencyId: string): number => {
    const competency = competencies.find(c => c.id === competencyId);
    if (!competency) return 0;
    
    // Se la competenza è acquisita, progresso completo
    if (acquiredCompetencies.includes(competencyId)) {
      return 100;
    }
    
    // Progresso parziale basato sul livello
    return Math.min(competency.level * 30, 90); // 30% per livello
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t("loading_competencies")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {t("eu_competencies")}
          </h3>
          <p className="text-gray-600 text-sm">
            {t("competencies_description")}
          </p>
        </div>
        
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">
              {calculateOverallProgress()}%
            </div>
            <div className="text-sm text-blue-600">
              {t("overall_mastery")}
            </div>
          </div>
        </div>
      </div>
      
      {/* Competencies grid */}
      <div className="space-y-4">
        {competencies.map((competency) => {
          const isAcquired = acquiredCompetencies.includes(competency.id);
          const progress = getCompetencyProgress(competency.id);
          
          return (
            <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Competency info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${competency.color}`}>
                      {competency.euFramework}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(competency.level)} text-white`}>
                      {getLevelLabel(competency.level)}
                    </div>
                    {isAcquired && (
                      <span className="text-green-600 text-sm font-medium">✅ {t("acquired")}</span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1">
                    {competency.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {competency.description}
                  </p>
                </div>
                
                {/* Progress */}
                <div className="w-full md:w-48">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{t("mastery")}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAcquired ? 'bg-green-500' : getLevelColor(competency.level)
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isAcquired 
                      ? t("competency_acquired")
                      : progress >= 70 
                      ? t("near_completion")
                      : t("in_progress")
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">{t("competency_levels")}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">{t("level_basic")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">{t("level_intermediate")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm">{t("level_advanced")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">✅ {t("acquired")}</span>
          </div>
        </div>
      </div>
      
      {/* EU Framework reference */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">🇪🇺</div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">
              {t("eu_framework_title")}
            </h4>
            <p className="text-gray-600 text-sm">
              {t("eu_framework_description")}
            </p>
            <div className="flex gap-3 mt-2">
              <a 
                href="https://digcomp.eu/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                DigComp 2.1 →
              </a>
              <a 
                href="https://ec.europa.eu/jrc/en/lifecomp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                LifeComp →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}