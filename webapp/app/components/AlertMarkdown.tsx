'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AlertMarkdownProps {
  content: string;
  className?: string;
}

export default function AlertMarkdown({ content, className = "" }: AlertMarkdownProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Personalizza i componenti per un styling migliore
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-gray-700" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote 
              className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4" 
              {...props} 
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            
            if (inline) {
              return (
                <code 
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                <code className={`font-mono text-sm ${className}`} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-700" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 hover:text-blue-800 underline" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
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