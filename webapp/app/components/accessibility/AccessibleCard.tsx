'use client';

import { ReactNode } from 'react';

interface AccessibleCardProps {
  title: string;
  description: string;
  children: ReactNode;
  onAction?: () => void;
  role?: string;
  ariaLabel?: string;
}

export default function AccessibleCard({
  title,
  description,
  children,
  onAction,
  role = 'region',
  ariaLabel
}: AccessibleCardProps) {
  const cardId = `card-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <article 
      id={cardId}
      className="
        bg-white 
        border 
        border-gray-200 
        rounded-xl
        
        /* Responsive padding */
        p-4 
        sm:p-5 
        md:p-6
        
        /* Shadow con contrasto */
        shadow-[0_1px_3px_rgba(0,0,0,0.1)]
        hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]
        
        /* Focus styles - alto contrasto */
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-600 
        focus:ring-offset-2
        
        /* Transition per preferenze ridotte */
        transition-all 
        duration-200
        
        /* Reduced motion support */
        motion-reduce:transition-none
      "
      role={role}
      aria-label={ariaLabel || title}
      aria-labelledby={`${cardId}-title`}
      aria-describedby={`${cardId}-desc`}
      tabIndex={0}
    >
      {/* Header con contrasto garantito */}
      <header className="mb-4 md:mb-6">
        <h3 
          id={`${cardId}-title`}
          className="
            text-lg 
            md:text-xl 
            lg:text-2xl 
            font-bold 
            text-gray-900
            mb-2
          "
        >
          {title}
        </h3>
        
        <p 
          id={`${cardId}-desc`}
          className="
            text-gray-700 
            text-sm 
            md:text-base 
            lg:text-lg
          "
        >
          {description}
        </p>
      </header>
      
      {/* Contenuto principale */}
      <div className="
        /* Text scaling */
        text-base 
        md:text-lg
        
        /* Line height per leggibilità */
        leading-relaxed
        
        /* Minimum font size */
        text-[16px]
        
        /* Spacing responsive */
        space-y-3 
        md:space-y-4
      ">
        {children}
      </div>
      
      {/* Azioni - Touch target garantiti */}
      {onAction && (
        <footer className="mt-6 md:mt-8">
          <button
            onClick={onAction}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAction();
              }
            }}
            className="
              /* Touch target minimo WCAG */
              min-h-[44px]
              min-w-[44px]
              
              /* Padding per mobile/desktop */
              px-4 
              py-2 
              md:px-6 
              md:py-3
              
              /* Colori ad alto contrasto */
              bg-blue-600 
              text-white 
              
              /* Border radius consistente */
              rounded-lg
              
              /* Typography */
              font-medium
              text-sm 
              md:text-base
              
              /* Hover state - non solo colore */
              hover:bg-blue-700 
              hover:shadow-md
              
              /* Focus state - molto visibile */
              focus:outline-none 
              focus:ring-2 
              focus:ring-blue-600 
              focus:ring-offset-2
              focus:ring-offset-white
              
              /* Active state */
              active:bg-blue-800
              
              /* Disabled state */
              disabled:opacity-50 
              disabled:cursor-not-allowed
              disabled:hover:bg-blue-600
              
              /* Transitions rispettano preferenze */
              transition-all 
              duration-200
              motion-reduce:transition-none
            "
            aria-label={`Esegui azione: ${title}`}
          >
            <span className="flex items-center justify-center gap-2">
              <span aria-hidden="true">▶</span>
              <span>{'Azione'}</span>
            </span>
          </button>
        </footer>
      )}
    </article>
  );
}