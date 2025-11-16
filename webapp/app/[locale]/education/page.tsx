// app/[locale]/education/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function EducationPage() {
  // 1. Recupera le traduzioni per la pagina "education"
  const t = await getTranslations('EducationPage');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 2. Titolo della pagina, tradotto */}
      <h1 className="text-3xl font-bold mb-6">🎓 {t('title')}</h1>
      
      <div className="prose max-w-none">
        {/* 3. Descrizione, tradotta */}
        <p className="text-lg text-gray-600">
          {t('description')}
        </p>
        
        {/* 4. Placeholder per i contenuti futuri */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            {t('coming_soon')}
          </p>
        </div>
      </div>
    </div>
  );
}