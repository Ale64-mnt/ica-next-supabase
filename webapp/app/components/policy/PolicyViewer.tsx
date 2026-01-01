// app/components/policy/PolicyViewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocale, useTranslations } from 'next-intl';

interface PolicyViewerProps {
  policyType: 'privacy' | 'cookie';
}

export function PolicyViewer({ policyType }: PolicyViewerProps) {
  const locale = useLocale();
  const t = useTranslations('Policies');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Carica il contenuto markdown dalla API
        const response = await fetch(`/api/policy/${locale}/${policyType}`);
        
        if (!response.ok) {
          throw new Error('Failed to load content');
        }

        const text = await response.text();
        setContent(text);

      } catch (err) {
        console.error(`Error loading ${policyType} policy:`, err);
        
        // Fallback all'inglese se la traduzione non esiste
        if (locale !== 'en') {
          try {
            const fallbackResponse = await fetch(`/api/policy/en/${policyType}`);
            if (fallbackResponse.ok) {
              const fallbackText = await fallbackResponse.text();
              setContent(fallbackText);
              setError(t('fallbackNote'));
            }
          } catch (fallbackErr) {
            setError(t('error.loading'));
          }
        } else {
          setError(t('error.loading'));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [locale, policyType, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Intestazione */}
      <header className="mb-8 pb-6 border-b">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t(`${policyType}.title`)}
        </h1>
        <p className="text-gray-600">
          {t('lastUpdated')}: <time>{new Date().toLocaleDateString(locale)}</time>
        </p>
        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}
      </header>

      {/* Contenuto Markdown - Qui è dove viene visualizzato il contenuto della policy */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
      
      {/* NOTA: Non aggiungere una sezione "Contatti" fissa qui.
          I contatti devono essere già inclusi nel contenuto markdown delle policy.
          Questo evita duplicazioni e garantisce che i contatti siano quelli ufficiali. */}
    </article>
  );
}