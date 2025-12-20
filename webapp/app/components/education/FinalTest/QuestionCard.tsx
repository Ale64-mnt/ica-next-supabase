"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

interface QuestionCardProps {
  question: {
    id: string;
    question_text: string;
    options: string[] | Record<string, string>;
    correct_answer: string;
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
  };
  selectedAnswer: string | undefined;
  onSelectAnswer: (answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
  showDifficulty?: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelectAnswer,
  questionNumber,
  totalQuestions,
  showDifficulty = false
}: QuestionCardProps) {
  const t = useTranslations("FinalTest");
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return t("difficulty_easy") || "Easy";
      case "medium": return t("difficulty_medium") || "Medium";
      case "hard": return t("difficulty_hard") || "Hard";
      default: return difficulty;
    }
  };

  // Gestione opzioni (supporta sia array che oggetto)
  const getOptions = () => {
    if (Array.isArray(question.options)) {
      return question.options.map((option, index) => ({
        id: `${question.id}-option-${index}`,
        label: option,
        value: option
      }));
    }
    
    // Se è un oggetto, converte in array
    return Object.entries(question.options as Record<string, string>).map(([key, value]) => ({
      id: `${question.id}-option-${key}`,
      label: value,
      value: key
    }));
  };

  const options = getOptions();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
      {/* Header della domanda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg font-bold text-blue-600">
              {t("question") || "Question"} {questionNumber}
            </span>
            {showDifficulty && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {getDifficultyLabel(question.difficulty)}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">
            {t("points") || "Points"}: {question.points}
          </p>
        </div>
        
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded">
          {questionNumber}/{totalQuestions}
        </div>
      </div>
      
      {/* Testo della domanda */}
      <div className="mb-8">
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          {typeof question.question_text === "string" 
            ? question.question_text 
            : question.question_text}
        </h3>
      </div>
      
      {/* Opzioni di risposta */}
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectAnswer(option.value)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
              selectedAnswer === option.value
                ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
            aria-label={`Select option: ${option.label}`}
            aria-pressed={selectedAnswer === option.value}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${
                selectedAnswer === option.value
                  ? "bg-blue-500 border-blue-500"
                  : "bg-white border-gray-300"
              }`}>
                {selectedAnswer === option.value ? (
                  <span className="text-white text-xs">✓</span>
                ) : (
                  <span className="text-gray-400 text-xs">○</span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-gray-800">{option.label}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Spiegazione (mostra se la risposta è stata data) */}
      {selectedAnswer && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            {t("explanation") || "Explanation"}
          </h4>
          <p className="text-blue-700 text-sm">
            {typeof question.explanation === "string" 
              ? question.explanation 
              : question.explanation}
          </p>
        </div>
      )}
      
      {/* Feedback immediato se risposta corretta/sbagliata */}
      {selectedAnswer && (
        <div className={`mt-4 p-3 rounded-lg text-center ${
          selectedAnswer === question.correct_answer
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {selectedAnswer === question.correct_answer ? (
            <div className="flex items-center justify-center gap-2">
              <span>✅</span>
              <span className="font-medium">
                {t("correct_answer") || "Correct answer!"}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>❌</span>
              <span className="font-medium">
                {t("incorrect_answer") || "Incorrect answer"}
              </span>
              <span className="text-sm ml-2">
                ({t("correct_is") || "Correct is"}: {question.correct_answer})
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}