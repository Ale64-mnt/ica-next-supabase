// webapp/app/components/blog/CategoryFilters.tsx
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CategoryFiltersProps {
  locale: string;
  currentCategory?: string;
  categories: Array<{
    key: string;
    name: string;
    count: number;
  }>;
}

export default function CategoryFilters({ 
  locale, 
  currentCategory,
  categories 
}: CategoryFiltersProps) {
  const t = useTranslations('Blog');
  const searchParams = useSearchParams();
  
  // Costruisci URL mantenendo altri parametri
  const buildUrl = (category: string | null) => {
    // ✅ Gestisci il caso in cui searchParams sia null
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    // Rimuovi pagina quando cambia categoria
    params.delete('page');
    
    return `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {t('filter_by_category') || 'Filtra per categoria:'}
        </h3>
        
        {/* Bottone "Tutte le categorie" */}
        <Link
          href={buildUrl(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !currentCategory 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t('all_categories') || 'Tutte'} ({categories.reduce((sum, cat) => sum + cat.count, 0)})
        </Link>
        
        {/* Filtri categoria */}
        {categories.map((category) => (
          <Link
            key={category.key}
            href={buildUrl(category.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentCategory === category.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.count})
          </Link>
        ))}
      </div>
      
      {/* Mostra categoria attiva */}
      {currentCategory && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <span className="text-sm text-gray-500">
              {t('showing_category') || 'Visualizzando categoria:'}
            </span>
            <span className="ml-2 font-semibold text-blue-700">
              {categories.find(c => c.key === currentCategory)?.name}
            </span>
          </div>
          <Link
            href={buildUrl(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('clear_filter') || '× Rimuovi filtro'}
          </Link>
        </div>
      )}
    </div>
  );
}