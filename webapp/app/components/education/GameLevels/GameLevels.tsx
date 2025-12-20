"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import LevelCard from "./LevelCard";
import ScenarioCard from "./ScenarioCard";
import { GameScenario, LevelProgress } from "./ScenarioTypes";

interface GameLevelsProps {
  moduleId: string;
  userId: string;
  locale: string;
  onComplete: () => void;
}

// Mock data - sostituire con chiamate API
const MOCK_LEVELS = [
  {
    id: 1,
    name: "Identificazione forme denaro",
    description: "Impara a riconoscere le diverse forme di denaro",
    scenariosCount: 4,
    unlocked: true
  },
  {
    id: 2,
    name: "Pagamenti digitali sicuri",
    description: "Scopri come effettuare pagamenti digitali in sicurezza",
    scenariosCount: 4,
    unlocked: false
  },
  {
    id: 3,
    name: "Riconoscimento truffe",
    description: "Impara a identificare e evitare le truffe finanziarie",
    scenariosCount: 4,
    unlocked: false
  },
  {
    id: 4,
    name: "Budget base",
    description: "Crea e gestisci il tuo primo budget personale",
    scenariosCount: 4,
    unlocked: false
  },
  {
    id: 5,
    name: "Simulazione reale",
    description: "Metti in pratica tutte le competenze acquisite",
    scenariosCount: 4,
    unlocked: false
  }
];

// Mock scenarios per il primo livello
const MOCK_SCENARIOS: GameScenario[] = [
  {
    id: "scenario-1-1",
    module_id: "module-1",
    level_number: 1,
    scenario_number: 1,
    title: { it: "Riconosci la moneta", en: "Identify the Coin" },
    description: { it: "Trascina l'immagine corretta nella zona di destinazione", en: "Drag the correct image to the target zone" },
    scenario_type: "drag_drop",
    content: {
      question: { it: "Quale di queste monete ha il valore più alto?", en: "Which of these coins has the highest value?" },
      drag_items: [
        { id: "coin-1", label: { it: "1 Euro", en: "1 Euro" } },
        { id: "coin-2", label: { it: "50 Centesimi", en: "50 Cents" } },
        { id: "coin-3", label: { it: "20 Centesimi", en: "20 Cents" } },
        { id: "coin-4", label: { it: "10 Centesimi", en: "10 Cents" } }
      ],
      drop_zones: [
        { id: "zone-1", label: { it: "Valore più alto", en: "Highest Value" }, correct_item_id: "coin-1" }
      ]
    },
    feedback: {
      correct: { it: "Corretto! 1 Euro ha il valore più alto.", en: "Correct! 1 Euro has the highest value." },
      incorrect: { it: "Non esatto. Prova a confrontare le monete.", en: "Not quite. Try comparing the coins." },
      explanation: { it: "La moneta da 1 Euro vale più delle monete da 50, 20 e 10 centesimi.", en: "The 1 Euro coin is worth more than 50, 20, and 10 cent coins." }
    },
    points: 100,
    difficulty: "easy"
  }
  // Aggiungi altri 3 scenari per il livello 1...
];

export default function GameLevels({ moduleId, userId, locale, onComplete }: GameLevelsProps) {
  const t = useTranslations("GameLevels");
  const router = useRouter();
  
  // State
  const [levels, setLevels] = useState(MOCK_LEVELS);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentScenario, setCurrentScenario] = useState<number>(0);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>({});
  const [scenarios, setScenarios] = useState<GameScenario[]>(MOCK_SCENARIOS);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);

  // Carica progresso iniziale
  useEffect(() => {
    loadUserProgress();
    loadScenarios();
  }, [moduleId, userId]);

  const loadUserProgress = async () => {
    setIsLoading(true);
    try {
      // TODO: Sostituire con chiamata API reale
      // const response = await fetch(`/api/education/modules/${moduleId}/progress?userId=${userId}`);
      // const data = await response.json();
      
      // Mock progress
      const mockProgress: Record<number, LevelProgress> = {
        1: { levelNumber: 1, scenariosCompleted: 0, totalScenarios: 4, score: 0, unlocked: true, completed: false },
        2: { levelNumber: 2, scenariosCompleted: 0, totalScenarios: 4, score: 0, unlocked: false, completed: false },
        3: { levelNumber: 3, scenariosCompleted: 0, totalScenarios: 4, score: 0, unlocked: false, completed: false },
        4: { levelNumber: 4, scenariosCompleted: 0, totalScenarios: 4, score: 0, unlocked: false, completed: false },
        5: { levelNumber: 5, scenariosCompleted: 0, totalScenarios: 4, score: 0, unlocked: false, completed: false }
      };
      
      setLevelProgress(mockProgress);
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScenarios = async (levelNumber?: number) => {
    try {
      if (levelNumber) {
        // TODO: Chiamata API per scenari specifici del livello
        // const response = await fetch(`/api/education/modules/${moduleId}/scenarios?level=${levelNumber}`);
        // const data = await response.json();
        // setScenarios(data);
      }
    } catch (error) {
      console.error("Error loading scenarios:", error);
    }
  };

  const handleLevelSelect = (levelNumber: number) => {
    if (levelProgress[levelNumber]?.unlocked) {
      setSelectedLevel(levelNumber);
      setCurrentScenario(0);
      // Carica scenari per questo livello
      loadScenarios(levelNumber);
    }
  };

  const handleScenarioComplete = useCallback(async (answers: any, timeSpent: number) => {
    if (!selectedLevel) return;

    const scenario = scenarios[currentScenario];
    const score = calculateScore(answers, scenario);
    
    // Aggiorna progresso locale
    setLevelProgress(prev => ({
      ...prev,
      [selectedLevel]: {
        ...prev[selectedLevel],
        scenariosCompleted: prev[selectedLevel].scenariosCompleted + 1,
        score: Math.max(prev[selectedLevel].score, score)
      }
    }));

    // Salva su API
    try {
      await fetch(`/api/education/scenarios/${scenario.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          scenarioId: scenario.id,
          moduleId,
          levelNumber: selectedLevel,
          scenarioNumber: currentScenario + 1,
          userAnswers: answers,
          score,
          timeSpent
        })
      });
    } catch (error) {
      console.error("Error saving scenario:", error);
    }

    // Passa allo scenario successivo o completa il livello
    if (currentScenario < scenarios.length - 1) {
      setTimeout(() => {
        setCurrentScenario(prev => prev + 1);
      }, 1500);
    } else {
      // Livello completato
      setLevelProgress(prev => ({
        ...prev,
        [selectedLevel]: {
          ...prev[selectedLevel],
          completed: true
        }
      }));
      
      // Sblocca livello successivo se esiste
      if (selectedLevel < 5) {
        setLevelProgress(prev => ({
          ...prev,
          [selectedLevel + 1]: {
            ...prev[selectedLevel + 1],
            unlocked: true
          }
        }));
      }

      // Mostra completamento
      setTimeout(() => {
        if (selectedLevel === 5) {
          // Tutti i livelli completati
          handleAllLevelsCompleted();
        } else {
          setSelectedLevel(null);
        }
      }, 2000);
    }
  }, [selectedLevel, currentScenario, scenarios, moduleId, userId]);

  const calculateScore = (answers: any, scenario: GameScenario): number => {
    // Logica semplificata
    return 85; // Mock score
  };

  const handleAllLevelsCompleted = async () => {
    setShowCompletion(true);
    
    // Salva completamento modulo
    try {
      await fetch(`/api/education/modules/${moduleId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: "levels_completed",
          score: calculateOverallScore(),
          timeSpent: calculateTotalTime()
        })
      });
    } catch (error) {
      console.error("Error completing levels:", error);
    }
  };

  const calculateOverallScore = (): number => {
    const scores = Object.values(levelProgress).map(lp => lp.score);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const calculateTotalTime = (): number => {
    // Mock
    return 45; // minuti
  };

  const handleContinueToFinalTest = () => {
    onComplete();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {t("all_levels_completed")}
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          {t("levels_completion_message")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowCompletion(false)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {t("review_levels")}
          </button>
          <button
            onClick={handleContinueToFinalTest}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {t("proceed_to_final")}
          </button>
        </div>
      </div>
    );
  }

  if (selectedLevel !== null) {
    const currentScenarioData = scenarios[currentScenario];
    const levelData = levels.find(l => l.id === selectedLevel);
    
    return (
      <div className="space-y-6">
        {/* Level header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t("level")} {selectedLevel}: {levelData?.name}
              </h2>
              <p className="text-gray-600 mt-1">
                {t("scenario")} {currentScenario + 1} {t("of")} {scenarios.length}
              </p>
            </div>
            <button
              onClick={() => setSelectedLevel(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {t("back_to_levels")}
            </button>
          </div>
          
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{t("scenario_progress")}</span>
              <span>{currentScenario + 1}/{scenarios.length}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Current scenario */}
        {currentScenarioData ? (
          <ScenarioCard
            scenario={currentScenarioData}
            onComplete={handleScenarioComplete}
            locale={locale}
          />
        ) : (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{t("no_scenarios_available")}</p>
          </div>
        )}
      </div>
    );
  }

  // Vista principale: lista livelli
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("description")}
        </p>
        
        {/* Overall progress */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-semibold text-blue-800">{t("overall_progress")}</h3>
              <p className="text-blue-600 text-sm">
                {Object.values(levelProgress).filter(lp => lp.completed).length} / 5 {t("levels_completed")}
              </p>
            </div>
            <button
              onClick={() => router.push("/education/modules")}
              className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {t("back_to_modules")}
            </button>
          </div>
        </div>
      </div>
      
      {/* Levels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => {
          const progress = levelProgress[level.id] || {
            levelNumber: level.id,
            scenariosCompleted: 0,
            totalScenarios: level.scenariosCount,
            score: 0,
            unlocked: level.unlocked,
            completed: false
          };
          
          return (
            <LevelCard
              key={level.id}
              levelNumber={level.id}
              levelName={level.name}
              description={level.description}
              scenariosCompleted={progress.scenariosCompleted}
              totalScenarios={progress.totalScenarios}
              score={progress.score}
              unlocked={progress.unlocked}
              completed={progress.completed}
              onSelect={() => handleLevelSelect(level.id)}
              locale={locale}
            />
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">{t("legend")}</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">{t("legend_unlocked")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">{t("legend_completed")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-sm">{t("legend_locked")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
