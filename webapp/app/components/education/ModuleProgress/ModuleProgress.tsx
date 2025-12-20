"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import ProgressTracker from "./ProgressTracker";

export type ModuleStatus = 
  | "not_started" 
  | "diagnostic_completed" 
  | "levels_completed" 
  | "completed";

export interface ModuleProgressData {
  moduleId: string;
  userId: string;
  status: ModuleStatus;
  score: number;
  diagnosticScore?: number;
  finalScore?: number;
  timeSpent: number; // in minuti
  completedAt?: Date;
  unlockedBadges: string[];
  acquiredCompetencies: string[];
}

interface ModuleProgressProps {
  moduleId: string;
  userId: string;
  currentStatus?: ModuleStatus;
  onStatusChange?: (newStatus: ModuleStatus) => void;
  showDetails?: boolean;
  compact?: boolean;
}

// Mock steps configuration
const MODULE_STEPS = [
  { id: 1, statusKey: "not_started", labelKey: "step_diagnostic", icon: "📊" },
  { id: 2, statusKey: "diagnostic_completed", labelKey: "step_levels", icon: "🎮" },
  { id: 3, statusKey: "levels_completed", labelKey: "step_final_test", icon: "📝" },
  { id: 4, statusKey: "completed", labelKey: "step_certificate", icon: "🏆" }
];

export default function ModuleProgress({
  moduleId,
  userId,
  currentStatus = "not_started",
  onStatusChange,
  showDetails = true,
  compact = false
}: ModuleProgressProps) {
  const t = useTranslations("ModuleProgress");
  
  const [progressData, setProgressData] = useState<ModuleProgressData>({
    moduleId,
    userId,
    status: currentStatus,
    score: 0,
    timeSpent: 0,
    unlockedBadges: [],
    acquiredCompetencies: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Carica i dati di progresso
  useEffect(() => {
    loadProgressData();
  }, [moduleId, userId]);
  
  const loadProgressData = async () => {
    setIsLoading(true);
    try {
      // TODO: Sostituire con chiamata API reale
      // const response = await fetch(`/api/education/user/progress?userId=${userId}&moduleId=${moduleId}`);
      // const data = await response.json();
      
      // Mock data per testing
      const mockData: ModuleProgressData = {
        moduleId,
        userId,
        status: currentStatus,
        score: getMockScore(currentStatus),
        diagnosticScore: currentStatus !== "not_started" ? 75 : undefined,
        finalScore: currentStatus === "completed" ? 85 : undefined,
        timeSpent: getMockTimeSpent(currentStatus),
        completedAt: currentStatus === "completed" ? new Date() : undefined,
        unlockedBadges: getMockBadges(currentStatus),
        acquiredCompetencies: getMockCompetencies(currentStatus)
      };
      
      setProgressData(mockData);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funzioni helper per mock data
  const getMockScore = (status: ModuleStatus): number => {
    switch (status) {
      case "not_started": return 0;
      case "diagnostic_completed": return 25;
      case "levels_completed": return 60;
      case "completed": return 85;
      default: return 0;
    }
  };
  
  const getMockTimeSpent = (status: ModuleStatus): number => {
    switch (status) {
      case "not_started": return 0;
      case "diagnostic_completed": return 10;
      case "levels_completed": return 45;
      case "completed": return 60;
      default: return 0;
    }
  };
  
  const getMockBadges = (status: ModuleStatus): string[] => {
    const badges = [];
    if (status !== "not_started") badges.push("explorer");
    if (status === "levels_completed" || status === "completed") badges.push("master");
    if (status === "completed") badges.push("expert");
    return badges;
  };
  
  const getMockCompetencies = (status: ModuleStatus): string[] => {
    const competencies = [];
    if (status !== "not_started") competencies.push("financial_literacy");
    if (status === "levels_completed" || status === "completed") {
      competencies.push("digital_payments", "fraud_prevention");
    }
    if (status === "completed") competencies.push("budgeting", "financial_planning");
    return competencies;
  };
  
  // Calcola lo step corrente
  const getCurrentStepIndex = (): number => {
    switch (progressData.status) {
      case "not_started": return 0;
      case "diagnostic_completed": return 1;
      case "levels_completed": return 2;
      case "completed": return 3;
      default: return 0;
    }
  };
  
  const currentStepIndex = getCurrentStepIndex();
  const totalSteps = MODULE_STEPS.length;
  const progressPercentage = (currentStepIndex / (totalSteps - 1)) * 100;
  
  // Formatta il tempo
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return t("minutes", { minutes });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? t("hours_minutes", { hours, minutes: remainingMinutes })
      : t("hours", { hours });
  };
  
  // Formatta la data
  const formatDate = (date?: Date): string => {
    if (!date) return "";
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };
  
  // Versione compatta per header
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg">
              {MODULE_STEPS[currentStepIndex].icon}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {t("current_progress")}
              </h4>
              <p className="text-sm text-gray-600">
                {t(MODULE_STEPS[currentStepIndex].labelKey)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {currentStepIndex + 1}/{totalSteps}
            </div>
            <div className="text-xs text-gray-500">
              {progressPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {showDetails && progressData.score > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {t("current_score")}: <span className="font-medium">{progressData.score}%</span>
          </div>
        )}
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t("title")}
        </h2>
        <p className="text-gray-600">
          {t("subtitle")}
        </p>
      </div>
      
      {/* Main content */}
      <div className="p-6">
        {/* Progress steps */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-green-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {MODULE_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    {/* Step circle */}
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      border-2 z-10 mb-2
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent
                        ? 'bg-white border-blue-500 text-blue-500'
                        : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    
                    {/* Step label */}
                    <div className="text-center">
                      <div className={`
                        text-sm font-medium
                        ${isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-blue-600' : 'text-gray-500'}
                      `}>
                        {t(step.labelKey)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {index < currentStepIndex 
                          ? t("completed") 
                          : index === currentStepIndex 
                          ? t("in_progress") 
                          : t("upcoming")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Progress stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {progressData.score}%
            </div>
            <div className="text-sm text-blue-600">
              {t("overall_score")}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 mb-1">
              {formatTime(progressData.timeSpent)}
            </div>
            <div className="text-sm text-green-600">
              {t("time_invested")}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {currentStepIndex + 1}/{totalSteps}
            </div>
            <div className="text-sm text-purple-600">
              {t("steps_completed")}
            </div>
          </div>
        </div>
        
        {/* Detailed scores */}
        {showDetails && (
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-3">{t("detailed_scores")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressData.diagnosticScore !== undefined && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{t("diagnostic_score")}</span>
                    <span className="font-bold text-lg">
                      {progressData.diagnosticScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${progressData.diagnosticScore}%` }}
                    />
                  </div>
                </div>
              )}
              
              {progressData.finalScore !== undefined && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{t("final_score")}</span>
                    <span className="font-bold text-lg">
                      {progressData.finalScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${progressData.finalScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Completion date */}
        {progressData.completedAt && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">📅</span>
              <div>
                <div className="font-medium text-gray-900">{t("completed_on")}</div>
                <div className="text-gray-600">{formatDate(progressData.completedAt)}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Competencies tracker */}
        <div className="mb-6">
          <ProgressTracker
            moduleId={moduleId}
            userId={userId}
            acquiredCompetencies={progressData.acquiredCompetencies}
          />
        </div>
        
        {/* Badges */}
        {progressData.unlockedBadges.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-900 mb-3">{t("badges_unlocked")}</h3>
            <div className="flex flex-wrap gap-3">
              {progressData.unlockedBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  <span>🏅</span>
                  <span className="text-sm font-medium">{t(`badge_${badge}`)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Status summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {progressData.status === "completed" ? "🎉" : 
               progressData.status === "levels_completed" ? "🚀" :
               progressData.status === "diagnostic_completed" ? "📊" : "🎯"}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">
                {t(`status_${progressData.status}`)}
              </h4>
              <p className="text-gray-600 text-sm mt-1">
                {t(`status_${progressData.status}_description`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}