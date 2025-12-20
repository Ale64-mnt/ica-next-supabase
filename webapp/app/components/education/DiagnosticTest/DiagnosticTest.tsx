"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import QuestionCard from "./QuestionCard";

interface DiagnosticTestProps {
  questions: Array<{
    id: string;
    question_text: string;
    options: string[] | Record<string, string>;
    correct_answer: string;
    explanation?: string;
  }>;
  moduleId: string;
  locale: string;
}

export default function DiagnosticTest({
  questions,
  moduleId,
  locale,
}: DiagnosticTestProps) {
  const t = useTranslations("DiagnosticTest");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Focus management per accessibilità
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [currentQuestion, showResults]);

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, questions.length]);

  const calculateScore = useCallback(async () => {
    setIsSubmitting(true);
    
    // Calcola punteggio
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    const calculatedScore = Math.round((correct / questions.length) * 100);
    setScore(calculatedScore);
    
    // Simula delay per feedback
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setShowResults(true);
    setIsSubmitting(false);
    
    // TODO: Salva progresso via API
    // await fetch(`/api/education/modules/${moduleId}/progress`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     score: calculatedScore,
    //     status: "diagnostic_completed",
    //   }),
    // });
  }, [answers, questions, moduleId]);

  // Gestione tastiera per accessibilità
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResults) return;
      
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          if (currentQuestion < questions.length - 1) {
            handleNext();
          }
          break;
        case "Enter":
          if (currentQuestion === questions.length - 1 && Object.keys(answers).length === questions.length) {
            e.preventDefault();
            calculateScore();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, answers, showResults, questions.length, handlePrevious, handleNext, calculateScore]);

  if (questions.length === 0) {
    return (
      <div
        className="bg-white border border-gray-200 rounded-xl p-8 text-center"
        role="alert"
        aria-live="polite"
      >
        <p className="text-gray-600">{t("no_questions_available") || "No questions available"}</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div
        ref={mainRef}
        className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 text-center"
        role="region"
        aria-label={t("results_announcement") || "Test Results"}
        tabIndex={-1}
      >
        <div className="text-5xl mb-6" aria-hidden="true">
          {score >= 70 ? "🎉" : "📊"}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {t("your_score") || "Your Score"}
        </h2>
        
        <div
          className="text-5xl md:text-6xl font-bold text-blue-600 mb-6"
          aria-live="assertive"
        >
          {score}%
        </div>
        
        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          {score >= 70
            ? t("good_score_message") || "Great job! You have a good understanding of the topic."
            : t("improvement_needed_message") || "There's room for improvement. The learning modules will help you."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowResults(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
            aria-label={t("review_answers") || "Review answers"}
          >
            {t("review_answers") || "Review Answers"}
          </button>
          
          <button
            onClick={() => {
              // TODO: Navigate to game levels
              console.log("Continue to game levels");
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px]"
            aria-label={t("continue_to_levels") || "Continue to learning levels"}
          >
            {t("continue_to_levels") || "Continue to Levels"}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      ref={mainRef}
      className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 lg:p-8"
      role="main"
      aria-label={t("diagnostic_test_in_progress") || "Diagnostic Test"}
      tabIndex={-1}
    >
      {/* Progress indicator */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {t("title") || "Diagnostic Test"}
          </h2>
          <span className="text-sm md:text-base text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {t("question_count", {
              current: currentQuestion + 1,
              total: questions.length,
            }) || `Question ${currentQuestion + 1} of ${questions.length}`}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t("progress") || "Progress"}</span>
            <span>
              {t("answered_count", { 
                answered: answeredCount, 
                total: questions.length 
              }) || `${answeredCount}/${questions.length} answered`}
            </span>
          </div>
          <div
            className="h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
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
      />

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {t("navigation_hint") || "Use arrow keys or buttons to navigate"}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent min-h-[44px] min-w-[44px]"
            aria-label={t("previous_question") || "Previous question"}
          >
            {t("previous") || "Previous"}
          </button>
          
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={t("next_question") || "Next question"}
            >
              {t("next") || "Next"}
            </button>
          ) : (
            <button
              onClick={calculateScore}
              disabled={answeredCount < questions.length || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px] flex items-center gap-2"
              aria-label={t("submit_results") || "Submit test results"}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {t("submitting") || "Submitting..."}
                </>
              ) : (
                t("submit_results") || "Submit Results"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}