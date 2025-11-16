'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface AccessibleCardProps {
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  role?: 'link' | 'button' | 'article';
  children?: ReactNode;
  className?: string;
  'aria-describedby'?: string;
}

export function AccessibleCard({
  title,
  description,
  href,
  onClick,
  role = 'article',
  children,
  className = '',
  'aria-describedby': ariaDescribedBy,
}: AccessibleCardProps) {
  // Classi base responsive e accessibili
  const baseClasses = `
    bg-white rounded-xl shadow-lg p-6 
    md:p-8 lg:p-6 xl:p-8
    border-2 border-transparent 
    hover:shadow-xl hover:border-blue-300 
    focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-offset-2
    transition-all duration-300
    min-h-[120px] md:min-h-[140px]
    block w-full h-full
    text-left
    group
    ${className}
  `;

  const content = (
    <>
      {/* Titolo responsive */}
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
        {title}
      </h3>
      
      {/* Descrizione responsive */}
      <p className="text-gray-700 mb-4 text-sm md:text-base">
        {description}
      </p>
      
      {children}
    </>
  );

  // Screen reader description
  const srDescription = ariaDescribedBy ? null : (
    <div className="sr-only">
      {href 
        ? `Press Enter to explore ${title} section` 
        : `Press Enter to select ${title}`
      }
    </div>
  );

  if (href) {
    return (
      <article 
        role={role} 
        className="h-full transform transition-transform hover:scale-[1.02] focus-within:scale-[1.02]"
      >
        {srDescription}
        <Link
          href={href}
          className={baseClasses}
          aria-label={`${title}. ${description}. Press Enter to explore.`}
          aria-describedby={ariaDescribedBy}
        >
          {content}
        </Link>
      </article>
    );
  }

  if (onClick) {
    return (
      <article 
        role={role} 
        className="h-full transform transition-transform hover:scale-[1.02] focus-within:scale-[1.02]"
      >
        {srDescription}
        <button
          onClick={onClick}
          className={baseClasses}
          aria-label={`${title}. ${description}. Press Enter to select.`}
          aria-describedby={ariaDescribedBy}
        >
          {content}
        </button>
      </article>
    );
  }

  return (
    <article 
      role={role}
      className={baseClasses}
      aria-label={`${title}. ${description}.`}
      aria-describedby={ariaDescribedBy}
    >
      {srDescription}
      {content}
    </article>
  );
}