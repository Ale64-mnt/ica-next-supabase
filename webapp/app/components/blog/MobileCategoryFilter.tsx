'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CategoryHierarchy from './CategoryHierarchy';
import { CategoryNode } from '@/app/utils/categoryHelpers';

interface MobileCategoryFilterProps {
  categories: CategoryNode[];
  currentLocale: string;
  selectedCategory?: string;
}

export default function MobileCategoryFilter({
  categories,
  currentLocale,
  selectedCategory
}: MobileCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('Blog');

  return (
    <>
      {/* Bottone trigger mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>

      {/* Overlay e pannello */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Pannello filtro */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{t('filter_by_category')}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <CategoryHierarchy
                categories={categories}
                currentLocale={currentLocale}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}