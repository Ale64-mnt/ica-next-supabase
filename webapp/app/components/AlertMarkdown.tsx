// webapp/app/components/AlertMarkdown.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AlertMarkdownProps {
  content: string;
  className?: string;
}

export default function AlertMarkdown({ content, className = "" }: AlertMarkdownProps) {
  return (
    <div className={`prose prose-sm sm:prose-base md:prose-lg max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // HEADERS RESPONSIVE
          h1: ({ node, ...props }) => (
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-5 sm:mt-6 mb-2 sm:mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mt-4 sm:mt-5 mb-2" {...props} />
          ),
          
          // TESTO RESPONSIVE
          p: ({ node, ...props }) => (
            <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base" {...props} />
          ),
          
          // LISTE RESPONSIVE
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700 text-sm sm:text-base pl-1" {...props} />
          ),
          
          // BLOCKQUOTE RESPONSIVE
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-3 sm:border-l-4 border-blue-500 pl-3 sm:pl-4 italic text-gray-600 my-3 sm:my-4 text-sm sm:text-base" 
              {...props} 
            />
          ),
          
          // CODE BLOCKS RESPONSIVE
          code: ({ node, className, children, ...props }) => {
            const isInline = !className?.includes('language-');
            
            if (isInline) {
              return (
                <code 
                  className="bg-gray-100 text-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <div className="my-3 sm:my-4 overflow-hidden">
                <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm">
                  <code className={`font-mono ${className}`} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // TABELLE RESPONSIVE
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 sm:my-6 -mx-2 sm:mx-0">
              <div className="min-w-full inline-block">
                <table className="min-w-full divide-y divide-gray-300 text-sm sm:text-base" {...props} />
              </div>
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-2 sm:px-4 py-2 text-left font-semibold text-gray-900 text-xs sm:text-sm" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-2 sm:px-4 py-2 text-gray-700 text-xs sm:text-sm" {...props} />
          ),
          
          // LINK RESPONSIVE
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base break-words" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          
          // GRASSETTO E CORSO
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}