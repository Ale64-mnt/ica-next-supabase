'use client';
import React from 'react'; 
import { ReactNode } from 'react';

interface AccessibleLoadingProps {
  itemCount?: number;
  'aria-label'?: string;
  message?: string;
  children?: ReactNode;
}

export function AccessibleLoading({
  itemCount = 4,
  'aria-label': ariaLabel = 'Content loading',
  message = 'Loading content',
  children,
}: AccessibleLoadingProps) {
  return (
    <>
      {/* ARIA Live Region for screen readers */}
      <div 
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {message}
      </div>

      {/* Visual loading indicator responsive */}
      <div 
        role="status"
        aria-label={ariaLabel}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
      >
        {children || [...Array(itemCount)].map((_, index) => (
          <div 
            key={index}
            className="bg-gray-200 rounded-lg p-6 md:p-8 animate-pulse"
            aria-hidden="true"
          >
            <div className="h-5 md:h-6 bg-gray-300 rounded mb-3 md:mb-4"></div>
            <div className="h-3 md:h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 md:h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      <div className="sr-only">
        {message}. Please wait while content loads.
      </div>
    </>
  );
}