"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { it, enUS, fr, de, es } from "date-fns/locale";
import jsPDF from "jspdf";

interface CertificateProps {
  userName: string;
  moduleName: string;
  score: number;
  completionDate: Date;
  certificateId: string;
  locale?: string;
}

export default function Certificate({
  userName,
  moduleName,
  score,
  completionDate,
  certificateId,
  locale = "it"
}: CertificateProps) {
  const t = useTranslations("Certificate");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Mapping delle lingue
  const localeMap = {
    it,
    en: enUS,
    fr,
    de,
    es
  } as const;

  // Formatta la data
  const formatCertificateDate = (date: Date): string => {
    const selectedLocale = localeMap[locale as keyof typeof localeMap] || it;
    return format(date, "dd MMMM yyyy", { locale: selectedLocale });
  };

  // Determina il livello
  const getCompetencyLevel = (scoreValue: number): string => {
    if (scoreValue >= 90) return t("excellent", { defaultValue: "Excellent" });
    if (scoreValue >= 80) return t("very_good", { defaultValue: "Very Good" });
    if (scoreValue >= 70) return t("good", { defaultValue: "Good" });
    if (scoreValue >= 60) return t("sufficient", { defaultValue: "Sufficient" });
    return t("needs_improvement", { defaultValue: "Needs Improvement" });
  };

  // Genera PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape" as const,
        unit: "mm" as const,
        format: "a4" as const
      });

      // Sfondo bianco semplice
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 297, 210, "F");

      // Titolo
      doc.setFontSize(32);
      doc.setTextColor(25, 118, 210);
      doc.text(t("title", { defaultValue: "Certificate of Achievement" }), 148, 40, { align: "center" });

      // Linea decorativa
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(2);
      doc.line(50, 50, 247, 50);

      // Testo principale
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text(t("awarded_to", { defaultValue: "This certificate is awarded to" }), 148, 70, { align: "center" });

      // Nome utente
      doc.setFontSize(28);
      doc.setTextColor(25, 118, 210);
      doc.setFont("helvetica", "bold");
      doc.text(userName, 148, 90, { align: "center" });

      // Per il completamento di
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "normal");
      doc.text(`${t("for_completion", { defaultValue: "For successful completion of" })}:`, 148, 110, { align: "center" });

      // Nome modulo
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const moduleLines = doc.splitTextToSize(moduleName, 200);
      doc.text(moduleLines, 148, 125, { align: "center" });

      // Punteggio e livello
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text(`${t("score_achieved", { defaultValue: "Score Achieved" })}: ${score}%`, 148, 145, { align: "center" });
      doc.text(`${t("competency_level", { defaultValue: "Competency Level" })}: ${getCompetencyLevel(score)}`, 148, 155, { align: "center" });

      // Data e ID certificato
      doc.setFontSize(12);
      doc.setTextColor(97, 97, 97);
      doc.text(`${t("date", { defaultValue: "Date" })}: ${formatCertificateDate(completionDate)}`, 50, 175);
      doc.text(`${t("certificate_id", { defaultValue: "Certificate ID" })}: ${certificateId}`, 200, 175, { align: "right" });

      // Firma
      doc.setFontSize(10);
      doc.text(t("signature", { defaultValue: "Digital Signature" }), 148, 190, { align: "center" });
      doc.line(120, 195, 176, 195);

      // Salva il PDF
      doc.save(`certificate-${certificateId}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback: scarica una versione testo
      const element = document.createElement("a");
      const text = `
${t("title", { defaultValue: "Certificate" })}
${t("awarded_to", { defaultValue: "Awarded to" })}: ${userName}
${t("for_completion", { defaultValue: "For completion of" })}: ${moduleName}
${t("score_achieved", { defaultValue: "Score Achieved" })}: ${score}%
${t("date", { defaultValue: "Date" })}: ${formatCertificateDate(completionDate)}
${t("certificate_id", { defaultValue: "Certificate ID" })}: ${certificateId}
      `;
      element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
      element.setAttribute("download", `certificate-${certificateId}.txt`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Condividi
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t("share_title", { defaultValue: "I completed a financial education module!" }),
        text: `${t("share_text", { defaultValue: "I just completed" })} ${moduleName} ${t("with_score", { defaultValue: "with a score of" })} ${score}%`,
        url: window.location.href,
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback per browser che non supportano Web Share API
      const text = `${t("share_text", { defaultValue: "I just completed" })} ${moduleName} ${t("with_score", { defaultValue: "with a score of" })} ${score}% - ${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        alert(t("copied_to_clipboard", { defaultValue: "Achievement copied to clipboard!" }));
      }).catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
    }
  };

  // Stampa
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-100 overflow-hidden max-w-4xl mx-auto">
      {/* Intestazione */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
        <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
          {t("title", { defaultValue: "Certificate of Achievement" })}
        </h1>
        <p className="text-blue-600">{t("subtitle", { defaultValue: "Recognizing Successful Completion" })}</p>
      </div>
      
      {/* Corpo del certificato */}
      <div className="p-6 md:p-8">
        <div className="border-2 border-dashed border-blue-200 rounded-lg p-8 mb-6">
          <div className="text-center mb-8">
            <p className="text-lg text-gray-600 mb-4">
              {t("awarded_to", { defaultValue: "This certificate is awarded to" })}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6">
              {userName}
            </h2>
            
            <p className="text-gray-600 mb-2">
              {t("for_completion", { defaultValue: "For successful completion of" })}
            </p>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
              {moduleName}
            </h3>
            
            <div className="inline-block bg-blue-50 rounded-full px-6 py-3 mb-4">
              <span className="text-4xl font-bold text-blue-600">{score}%</span>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-semibold">{t("competency_level", { defaultValue: "Competency Level" })}:</span>{" "}
                <span className="text-green-600 font-medium">{getCompetencyLevel(score)}</span>
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-500">
              <div>
                <p className="font-medium text-gray-700">{t("date", { defaultValue: "Date" })}</p>
                <p>{formatCertificateDate(completionDate)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t("certificate_id", { defaultValue: "Certificate ID" })}</p>
                <p className="font-mono">{certificateId}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">{t("validity", { defaultValue: "Valid" })}</p>
                <p>{t("permanent_validity", { defaultValue: "Permanent" })}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Azioni */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={t("download_certificate", { defaultValue: "Download certificate as PDF" })}
          >
            {isGeneratingPDF ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {t("generating_pdf", { defaultValue: "Generating PDF..." })}
              </>
            ) : (
              <>
                <span>📥</span>
                {t("download_pdf", { defaultValue: "Download PDF" })}
              </>
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            aria-label={t("share_achievement", { defaultValue: "Share your achievement" })}
          >
            <span>📤</span>
            {t("share_achievement", { defaultValue: "Share Achievement" })}
          </button>
          
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            aria-label={t("print_certificate", { defaultValue: "Print certificate" })}
          >
            <span>🖨️</span>
            {t("print", { defaultValue: "Print" })}
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center text-sm text-gray-500">
        <p>{t("footer_note", { defaultValue: "This certificate verifies successful completion of the educational module" })}</p>
      </div>
    </div>
  );
}