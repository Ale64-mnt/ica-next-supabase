"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import ResultsCard from "./ResultsCard";

interface FinalTestProps {
  questions: Array<{
    id: string;
    question_text: string;
    options: string[] | Record<string, string>;
    correct_answer: string;
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
  }>;
  moduleId: string;
  moduleName: string;
  userId: string;
  passingScore?: number;
  timeLimit?: number; // in minuti
}

export default function FinalTest({
  questions,
  moduleId,
  moduleName,
  userId,
  passingScore = 80,
  timeLimit = 30
}: FinalTestProps) {
  const t = useTranslations("FinalTest");
  const router = useRouter();
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in secondi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Refs
  const mainRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calcola punteggio
  const calculateScore = useCallback(() => {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach((question) => {
      totalPoints += question.points;
      if (answers[question.id] === question.correct_answer) {
        earnedPoints += question.points;
      }
    });
    
    const finalScore = Math.round((earnedPoints / totalPoints) * 100);
    setScore(finalScore);
    return finalScore;
  }, [answers, questions]);
  
  // Gestione timer
  useEffect(() => {
    if (!testStarted || showResults || timeRemaining <= 0) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, showResults, timeRemaining]);
  
  // Gestione submit automatico a tempo scaduto
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const finalScore = calculateScore();
    
    try {
      // Salva risultati via API
      await fetch(`/api/education/modules/${moduleId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          score: finalScore,
          status: finalScore >= passingScore ? "completed" : "failed",
          timeSpent: (timeLimit * 60) - timeRemaining,
          answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
            questionId,
            userAnswer,
            isCorrect: questions.find(q => q.id === questionId)?.correct_answer === userAnswer
          }))
        })
      });
      
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting test:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, calculateScore, isSubmitting, moduleId, passingScore, questions, timeLimit, timeRemaining, userId]);
  
  // Gestione submit manuale
  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setShowConfirmation(true);
      return;
    }
    
    await handleAutoSubmit();
  };
  
  // Focus management per accessibilità
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [currentQuestion, showResults]);
  
  // Gestione risposte
  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Formattazione tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Calcola progresso
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const hasPassed = score >= passingScore;
  
  // Se non ha iniziato il test, mostra la schermata di introduzione
  if (!testStarted) {
    return (
      <div
        ref={mainRef}
        className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 max-w-3xl mx-auto"
        role="main"
        tabIndex={-1}
      >
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("description")} <strong>{moduleName}</strong>
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            {t("test_details")}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>{t("total_questions")}:</strong> {questions.length}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>{t("time_limit")}:</strong> {timeLimit} {t("minutes")}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>{t("passing_score")}:</strong> {passingScore}%
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>
                <strong>{t("question_types")}:</strong> {t("multiple_choice")}
              </span>
            </li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            {t("instructions_title")}
          </h3>
          <ul className="space-y-2 text-yellow-700">
            <li>✓ {t("instruction_1")}</li>
            <li>✓ {t("instruction_2")}</li>
            <li>✓ {t("instruction_3")}</li>
            <li>✓ {t("instruction_4")}</li>
            <li>✓ {t("instruction_5")}</li>
          </ul>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setTestStarted(true)}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors min-h-[44px] text-lg"
            aria-label={t("start_test")}
          >
            {t("start_test")}
          </button>
        </div>
      </div>
    );
  }
  
  // Se mostra i risultati
  if (showResults) {
    return (
      <ResultsCard
        score={score}
        passed={hasPassed}
        passingScore={passingScore}
        totalQuestions={questions.length}
        correctAnswers={Object.values(answers).filter((answer, index) => 
          answer === questions[index]?.correct_answer
        ).length}
        timeSpent={(timeLimit * 60) - timeRemaining}
        moduleId={moduleId}
        moduleName={moduleName}
        userId={userId}
        onRetry={() => {
          setCurrentQuestion(0);
          setAnswers({});
          setShowResults(false);
          setTimeRemaining(timeLimit * 60);
          setIsSubmitting(false);
        }}
      />
    );
  }
  
  // Modal di conferma per submit incompleto
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {t("incomplete_test")}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("incomplete_warning", { 
              answered: answeredCount, 
              total: questions.length 
            })}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {t("continue_test")}
            </button>
            <button
              onClick={handleAutoSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {t("submit_anyway")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const currentQ = questions[currentQuestion];
  
  return (
    <div
      ref={mainRef}
      className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 lg:p-8 max-w-4xl mx-auto"
      role="main"
      aria-label={t("test_in_progress")}
      tabIndex={-1}
    >
      {/* Header con timer e progresso */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {t("title")}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {moduleName}
            </p>
          </div>
          
          {/* Timer */}
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-red-600" aria-hidden="true">⏱️</span>
              <span className="font-mono font-bold text-red-700 text-lg">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-red-600 text-xs mt-1">
              {t("time_remaining")}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t("progress")}</span>
            <span>
              {t("answered_count", { 
                answered: answeredCount, 
                total: questions.length 
              })}
            </span>
          </div>
          <div
            className="h-3 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      <QuestionCard
        question={currentQ}
        selectedAnswer={answers[currentQ.id]}
        onSelectAnswer={(answer) => handleAnswer(currentQ.id, answer)}
        questionNumber={currentQuestion + 1}
        totalQuestions={questions.length}
        showDifficulty={true}
      />
      
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {t("navigation_hint")}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[44px] min-w-[44px]"
            aria-label={t("previous_question")}
          >
            {t("previous")}
          </button>
          
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={t("next_question")}
            >
              {t("next")}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px] flex items-center gap-2"
              aria-label={t("submit_test")}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {t("submitting")}
                </>
              ) : (
                <>
                  <span>📤</span>
                  {t("submit_test")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Question navigation shortcuts */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {t("jump_to_question")}:
        </h3>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium border ${
                currentQuestion === index
                  ? "bg-blue-600 text-white border-blue-600"
                  : answers[questions[index].id]
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              } hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={t("go_to_question", { number: index + 1 })}
              aria-current={currentQuestion === index ? "page" : undefined}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      
      {/* Warning per tempo che sta per scadere */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-red-700 font-medium">
              {t("time_warning", { minutes: Math.ceil(timeRemaining / 60) })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}