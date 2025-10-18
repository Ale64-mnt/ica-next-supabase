// app/components/navigation/LocaleSwitcher.tsx - SERVER-SIDE VERSION
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChevronDown } from 'lucide-react';

type LocaleSwitcherProps = {
  currentLocale: string;
  currentPath: string;
};

export async function LocaleSwitcher({ currentLocale, currentPath }: LocaleSwitcherProps) {
  const t = await getTranslations('Common');

  const languages = [
    { code: 'it', name: 'Italiano', abbr: 'IT' },
    { code: 'en', name: 'English', abbr: 'EN' },
    { code: 'de', name: 'Deutsch', abbr: 'DE' },
    { code: 'es', name: 'Español', abbr: 'ES' },
    { code: 'fr', name: 'Français', abbr: 'FR' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  return (
    <div className="relative group">
      <button 
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
        aria-label={t('change_language')}
      >
        <span>{currentLanguage?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((language) => (
          <Link
            key={language.code}
            href={currentPath.replace(`/${currentLocale}`, `/${language.code}`)}
            className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
              currentLocale === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <span className="font-medium">{language.name}</span>
            <span className="text-xs text-gray-500 font-mono">{language.abbr}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}