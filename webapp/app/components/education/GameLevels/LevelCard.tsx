"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface LevelCardProps {
  levelNumber: number;
  levelName: string;
  description: string;
  scenariosCompleted: number;
  totalScenarios: number;
  score: number;
  unlocked: boolean;
  completed: boolean;
  onSelect: () => void;
  locale: string;
}

export default function LevelCard({
  levelNumber,
  levelName,
  description,
  scenariosCompleted,
  totalScenarios,
  score,
  unlocked,
  completed,
  onSelect,
  locale
}: LevelCardProps) {
  const t = useTranslations("GameLevels");
  
  const progress = totalScenarios > 0 ? (scenariosCompleted / totalScenarios) * 100 : 0;
  
  return (
    <div className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
      unlocked
        ? completed
          ? 'border-green-500 bg-green-50'
          : 'border-blue-500 bg-white hover:shadow-lg'
        : 'border-gray-300 bg-gray-50 opacity-75'
    }`}>
      {/* Lock icon for locked levels */}
      {!unlocked && (
        <div className="absolute top-4 right-4">
          <span className="text-2xl">🔒</span>
        </div>
      )}
      
      {/* Level number badge */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
        completed
          ? 'bg-green-500 text-white'
          : unlocked
          ? 'bg-blue-500 text-white'
          : 'bg-gray-300 text-gray-600'
      }`}>
        <span className="text-xl font-bold">{levelNumber}</span>
      </div>
      
      {/* Level info */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {t("level")} {levelNumber}: {levelName}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{t("progress")}</span>
          <span>{scenariosCompleted}/{totalScenarios} {t("scenarios")}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completed ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Score */}
      {score > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700">{t("score")}:</span>
            <span className="font-bold text-lg">{score}%</span>
          </div>
        </div>
      )}
      
      {/* Action button */}
      <button
        onClick={onSelect}
        disabled={!unlocked}
        className={`w-full py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
          unlocked
            ? completed
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {completed
          ? t("review_level")
          : unlocked
          ? scenariosCompleted > 0
            ? t("continue_level")
            : t("start_level")
          : t("locked")
        }
      </button>
      
      {/* Completion badge */}
      {completed && (
        <div className="absolute top-4 left-4">
          <span className="text-green-500 text-xl">✅</span>
        </div>
      )}
    </div>
  );
}
