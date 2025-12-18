import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  params: {
    locale: string;
    moduleId: string;
  };
}

export default function ModuleLayout({ children, params }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb/header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600 dark:text-gray-400">
            <a href={`/${params.locale}/education`} className="hover:text-gray-900 dark:hover:text-white">
              Educazione
            </a>
            {' > '}
            <a 
              href={`/${params.locale}/education/money_transactions/11-15`}
              className="hover:text-gray-900 dark:hover:text-white"
            >
              Denaro e Transazioni
            </a>
            {' > '}
            <span className="font-medium text-gray-900 dark:text-white">
              Modulo
            </span>
          </nav>
        </div>
      </div>
      
      {children}
    </div>
  );
}
