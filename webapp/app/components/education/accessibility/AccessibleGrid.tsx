'use client';
import React from 'react'; 
import { ReactNode } from 'react';

interface AccessibleGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  'aria-label': string;
  'aria-labelledby'?: string;
  className?: string;
}

export function AccessibleGrid({
  children,
  columns = 2,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  className = '',
}: AccessibleGridProps) {
  // Griglia responsive per tutti i breakpoint
  const gridColumns = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`
        grid gap-4 md:gap-6
        ${gridColumns[columns]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}