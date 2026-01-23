// webapp/app/components/blog/Pagination.tsx
'use client';

import Link from 'next/link';

interface PaginationProps {
  locale: string;
  currentPage: number;
  totalPages: number;
  currentCategory?: string;
}

export default function Pagination({
  locale,
  currentPage,
  totalPages,
  currentCategory
}: PaginationProps) {
  if (totalPages <= 1) return null;
  
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (page > 1) params.set('page', page.toString());
    return `/${locale}/blog${params.toString() ? `?${params.toString()}` : ''}`;
  };
  
  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      {/* Pagina Precedente */}
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Precedente
        </Link>
      )}
      
      {/* Numeri Pagine */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={buildPageUrl(page)}
          className={`px-4 py-2 border rounded-lg ${
            currentPage === page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}
      
      {/* Pagina Successiva */}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Successiva →
        </Link>
      )}
    </div>
  );
}