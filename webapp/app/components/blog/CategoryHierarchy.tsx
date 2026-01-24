'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CategoryNode {
  category_id: number;
  category_key: string;
  name: string;
  children?: CategoryNode[];
  count: number;
}

interface CategoryHierarchyProps {
  categories: CategoryNode[];
  currentLocale: string;
  selectedCategory?: string;
  selectedSubCategory?: string;
}

export default function CategoryHierarchy({
  categories,
  currentLocale,
  selectedCategory,
  selectedSubCategory
}: CategoryHierarchyProps) {
  const t = useTranslations('Blog');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    selectedCategory ? [selectedCategory] : []
  );

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(key => key !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const translateCategory = (categoryKey: string, type: 'macro' | 'sub') => {
    return t(`categories.${type}.${categoryKey}`) || categoryKey;
  };

  // Trova la macro-categoria selezionata
  const selectedMacro = categories.find(cat => 
    cat.category_key === selectedCategory || 
    cat.children?.some(child => child.category_key === selectedCategory)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {t('filter_by_category')}
        </h3>
        <Link
          href={`/${currentLocale}/blog`}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {t('clear_all')}
        </Link>
      </div>

      {/* Tutte le categorie */}
      <Link
        href={`/${currentLocale}/blog`}
        className={`flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 ${
          !selectedCategory && !selectedSubCategory
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm'
            : 'hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="font-semibold">{t('all_categories')}</span>
        <span className="text-sm bg-white px-2.5 py-1 rounded-full font-medium shadow-sm">
          {categories.reduce((sum, cat) => sum + cat.count, 0)}
        </span>
      </Link>

      {/* Macro-categorie */}
      {categories.map(macroCat => {
        const isExpanded = expandedCategories.includes(macroCat.category_key);
        const isSelected = selectedCategory === macroCat.category_key;
        
        return (
          <div key={macroCat.category_id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Macro-categoria header */}
            <button
              onClick={() => toggleCategory(macroCat.category_key)}
              className={`w-full flex justify-between items-center px-4 py-3 text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-semibold">
                  {translateCategory(macroCat.category_key, 'macro')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {macroCat.count} {t('articles')}
                </span>
                <Link
                  href={`/${currentLocale}/blog?category=${macroCat.category_key}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  {t('view_all')}
                </Link>
              </div>
            </button>

            {/* Sottocategorie (espandibile) */}
            {isExpanded && macroCat.children && macroCat.children.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200">
                {macroCat.children.map(subCat => (
                  <Link
                    key={subCat.category_id}
                    href={`/${currentLocale}/blog?category=${subCat.category_key}`}
                    className={`flex justify-between items-center px-4 py-2.5 pl-11 transition-colors ${
                      selectedSubCategory === subCat.category_key
                        ? 'bg-blue-100 text-blue-800 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="text-sm">
                      {translateCategory(subCat.category_key, 'sub')}
                    </span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded-full">
                      {subCat.count}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Breadcrumb se c'è una selezione */}
      {(selectedCategory || selectedSubCategory) && selectedMacro && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-500 mb-2">
            {t('current_filter')}:
          </h4>
          <div className="flex items-center text-sm text-gray-700">
            <Link
              href={`/${currentLocale}/blog`}
              className="text-blue-600 hover:text-blue-800"
            >
              {t('all_categories')}
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/${currentLocale}/blog?category=${selectedMacro.category_key}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {translateCategory(selectedMacro.category_key, 'macro')}
            </Link>
            {selectedSubCategory && selectedMacro.children?.find(c => c.category_key === selectedSubCategory) && (
              <>
                <span className="mx-2">›</span>
                <span className="font-medium">
                  {translateCategory(selectedSubCategory, 'sub')}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}