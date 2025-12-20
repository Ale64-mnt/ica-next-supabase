"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface ResultsCardProps {
  score: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  moduleId: string;
  moduleName: string;
  userId: string;
  onRetry: () => void;
}

export default function ResultsCard({
  score,
  passed,
  passingScore,
  totalQuestions,
  correctAnswers,
  timeSpent,
  moduleId,
  moduleName,
  userId,
  onRetry
}: ResultsCardProps) {
  const t = useTranslations("FinalTest");
  const router = useRouter();
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} ${t("minutes")} ${secs} ${t("seconds")}`;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className={`inline-block p-4 rounded-full mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
          <span className="text-4xl">
            {passed ? "🎉" : "📊"}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {passed ? t("congratulations") : t("test_failed")}
        </h1>
        <p className="text-gray-600">
          {passed ? t("module_completed") : t("try_again_message")}
        </p>
      </div>
      
      {/* Risultati dettagliati */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{score}%</div>
          <div className="text-sm text-blue-700">{t("final_score")}</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {correctAnswers}/{totalQuestions}
          </div>
          <div className="text-sm text-green-700">{t("correct_answers")}</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {formatTime(timeSpent)}
          </div>
          <div className="text-sm text-purple-700">{t("time_spent")}</div>
        </div>
      </div>
      
      {/* Messaggio di risultato */}
      <div className={`p-4 rounded-lg mb-8 ${passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className="flex items-start gap-3">
          <span className="text-lg">{passed ? "✅" : "⚠️"}</span>
          <div>
            <h3 className="font-semibold mb-1">
              {passed ? t("passed_message") : t("failed_message")}
            </h3>
            <p className="text-sm">
              {passed 
                ? t("passed_details", { score, passingScore })
                : t("failed_details", { score, passingScore })
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Azioni */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {passed ? (
          <>
            <button
              onClick={() => router.push(`/education/modules/${moduleId}/certificate`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>📜</span>
              {t("view_certificate")}
            </button>
            
            <button
              onClick={() => router.push("/education")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px]"
            >
              {t("browse_modules")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px]"
            >
              {t("retry_test")}
            </button>
            
            <button
              onClick={() => router.push(`/education/modules/${moduleId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px]"
            >
              {t("review_module")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}