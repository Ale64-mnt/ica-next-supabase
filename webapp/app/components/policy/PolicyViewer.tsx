// app/components/policy/PolicyViewer.tsx
'use client';

import React, { useEffect, useState } from 'react';
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
  const [note, setNote] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPolicy = async (loc: string) => {
      const response = await fetch(`/api/policy/${loc}/${policyType}`);
      if (!response.ok) {
        throw new Error(`Failed to load policy: ${loc}/${policyType}`);
      }
      return response.text();
    };

    const load = async () => {
      setIsLoading(true);
      setFatalError(null);
      setNote(null);

      try {
        const text = await fetchPolicy(locale);
        if (!cancelled) setContent(text);
      } catch (err) {
        console.error(`Error loading ${policyType} policy for locale ${locale}:`, err);

        // fallback a EN se locale diverso
        if (locale !== 'en') {
          try {
            const fallbackText = await fetchPolicy('en');
            if (!cancelled) {
              setContent(fallbackText);
              setNote(t('fallbackNote'));
            }
          } catch (fallbackErr) {
            console.error(`Error loading fallback EN policy for ${policyType}:`, fallbackErr);
            if (!cancelled) setFatalError(t('error.loading'));
          }
        } else {
          if (!cancelled) setFatalError(t('error.loading'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [locale, policyType, t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (fatalError && !content) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{fatalError}</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 pb-6 border-b">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t(`${policyType}.title`)}
        </h1>

        {/* NOTA IMPORTANTE:
            Non mostrare una data "Ultimo aggiornamento" generata automaticamente.
            La data deve stare SOLO nel markdown, e cambiare solo quando cambia il testo. */}

        {note && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800 text-sm">{note}</p>
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>

      {/* I contatti devono essere inclusi nel markdown, per evitare duplicazioni */}
    </article>
  );
}
