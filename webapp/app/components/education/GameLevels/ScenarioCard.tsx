"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GameScenario, ScenarioType } from "./ScenarioTypes";

interface ScenarioCardProps {
  scenario: GameScenario;
  onComplete: (answers: any, timeSpent: number) => void;
  locale: string;
}

export default function ScenarioCard({ scenario, onComplete, locale }: ScenarioCardProps) {
  const t = useTranslations("GameLevels");
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (scenario.time_limit && !isCompleted) {
      const interval = setInterval(() => {
        setTimeSpent((prev) => {
          if (prev >= scenario.time_limit!) {
            handleTimeout();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [scenario.time_limit, isCompleted]);

  const handleTimeout = () => {
    if (timer) clearInterval(timer);
    // Auto-submit on timeout
    submitAnswers();
  };

  const getLocalizedText = (text: Record<string, string> | string): string => {
    if (typeof text === "string") return text;
    return text[locale] || text.it || Object.values(text)[0];
  };

  const handleAnswer = (field: string, value: any) => {
    setUserAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const submitAnswers = () => {
    if (timer) clearInterval(timer);
    
    // Calcola punteggio (semplificato)
    const score = calculateScore(userAnswers);
    setIsCorrect(score >= 70);
    setShowFeedback(true);
    setIsCompleted(true);
    
    // Invia risultati dopo 2 secondi
    setTimeout(() => {
      onComplete(userAnswers, timeSpent);
    }, 2000);
  };

  const calculateScore = (answers: Record<string, any>): number => {
    // Logica di calcolo basata sul tipo di scenario
    switch (scenario.scenario_type) {
      case 'multiple_choice':
        return answers.selectedOption === scenario.content.correct_answer ? 100 : 0;
      
      case 'drag_drop':
        const correctDrops = Object.values(answers).filter((answer: any) => 
          scenario.content.drop_zones?.some(zone => 
            zone.id === answer.zoneId && zone.correct_item_id === answer.itemId
          )
        ).length;
        const totalDrops = scenario.content.drop_zones?.length || 1;
        return Math.round((correctDrops / totalDrops) * 100);
      
      case 'matching':
        const correctMatches = Object.values(answers).filter((match: any) => 
          scenario.content.pairs?.some(pair => 
            pair.left.id === match.leftId && 
            pair.right.id === match.rightId && 
            pair.correct_match
          )
        ).length;
        const totalPairs = scenario.content.pairs?.length || 1;
        return Math.round((correctMatches / totalPairs) * 100);
      
      default:
        return 50; // Default score
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render scenario per tipo
  const renderScenarioContent = () => {
    switch (scenario.scenario_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {getLocalizedText(scenario.content.question || {})}
            </h3>
            <div className="space-y-2">
              {scenario.content.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer('selectedOption', option.id)}
                  className={`w-full text-left p-4 rounded-lg border ${
                    userAnswers.selectedOption === option.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getLocalizedText(option.text)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'drag_drop':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {getLocalizedText(scenario.content.question || {})}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drag Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  {t("drag_items")}
                </h4>
                <div className="space-y-2">
                  {scenario.content.drag_items?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-gray-300 rounded-lg cursor-move"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', item.id)}
                    >
                      {getLocalizedText(item.label)}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Drop Zones */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">
                  {t("drop_zones")}
                </h4>
                <div className="space-y-3">
                  {scenario.content.drop_zones?.map((zone) => (
                    <div
                      key={zone.id}
                      className="min-h-[60px] border-2 border-dashed border-blue-300 rounded-lg p-3"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const itemId = e.dataTransfer.getData('text/plain');
                        handleAnswer(zone.id, { zoneId: zone.id, itemId });
                      }}
                    >
                      <p className="text-sm text-gray-600">
                        {getLocalizedText(zone.label)}
                      </p>
                      {userAnswers[zone.id] && (
                        <div className="mt-2 p-2 bg-blue-100 rounded">
                          {getLocalizedText(
                            scenario.content.drag_items?.find(
                              item => item.id === userAnswers[zone.id]?.itemId
                            )?.label || {}
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {getLocalizedText(scenario.content.question || {})}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-3">
                {scenario.content.pairs?.map((pair) => (
                  <div
                    key={pair.left.id}
                    className="p-4 bg-white border border-gray-300 rounded-lg"
                  >
                    {getLocalizedText(pair.left.text)}
                  </div>
                ))}
              </div>
              
              {/* Right Column */}
              <div className="space-y-3">
                {scenario.content.pairs?.map((pair) => (
                  <button
                    key={pair.right.id}
                    onClick={() => handleAnswer(pair.left.id, { 
                      leftId: pair.left.id, 
                      rightId: pair.right.id 
                    })}
                    className={`w-full p-4 border rounded-lg ${
                      userAnswers[pair.left.id]?.rightId === pair.right.id
                        ? 'bg-green-50 border-green-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getLocalizedText(pair.right.text)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              {t("scenario_type_not_supported")}
            </p>
          </div>
        );
    }
  };

  if (showFeedback) {
    return (
      <div className={`p-6 rounded-lg ${
        isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="text-center">
          <div className="text-4xl mb-4">
            {isCorrect ? "🎉" : "📝"}
          </div>
          <h3 className="text-xl font-bold mb-2">
            {isCorrect 
              ? getLocalizedText(scenario.feedback.correct)
              : getLocalizedText(scenario.feedback.incorrect)
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {getLocalizedText(scenario.feedback.explanation)}
          </p>
          <div className="inline-block bg-white px-4 py-2 rounded-full">
            <span className="font-bold text-lg">
              {t("points_earned")}: {scenario.points}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {getLocalizedText(scenario.title)}
          </h2>
          <p className="text-gray-600 mt-1">
            {getLocalizedText(scenario.description)}
          </p>
        </div>
        
        {scenario.time_limit && (
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">⏱️</span>
              <span className="font-mono font-bold">
                {formatTime(scenario.time_limit - timeSpent)}
              </span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              {t("time_remaining")}
            </p>
          </div>
        )}
      </div>
      
      {/* Difficulty Badge */}
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          scenario.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
          scenario.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {t(`difficulty_${scenario.difficulty}`)}
        </span>
        <span className="ml-3 text-gray-600">
          {t("points")}: {scenario.points}
        </span>
      </div>
      
      {/* Scenario Content */}
      <div className="mb-8">
        {renderScenarioContent()}
      </div>
      
      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={submitAnswers}
          disabled={Object.keys(userAnswers).length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {t("complete_scenario")}
        </button>
      </div>
    </div>
  );
}
