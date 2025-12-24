// app/components/navigation/LocaleSwitcher.client.tsx - VERSIONE DEFINITIVA
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown, Check } from 'lucide-react';

export function LocaleSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Common');
  
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState('it');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'it', name: 'Italiano', abbr: 'IT' },
    { code: 'en', name: 'English', abbr: 'EN' },
    { code: 'de', name: 'Deutsch', abbr: 'DE' },
    { code: 'es', name: 'Español', abbr: 'ES' },
    { code: 'fr', name: 'Français', abbr: 'FR' }
  ];

  // ✅ CORREZIONE: params può essere null
  useEffect(() => {
    setIsMounted(true);
    
    const currentLocale = params?.locale;
    
    if (currentLocale && typeof currentLocale === 'string') {
      setSelectedLocale(currentLocale);
    }
    // Nota: già inizializzato a 'it' di default
  }, [params?.locale]);

  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentLanguage = languages.find(lang => lang.code === selectedLocale);

  // ✅ FUNZIONE CORRETTA con tutti i null checks
  const buildLocalizedHref = (targetLocale: string) => {
    // Verifica che pathname esista
    if (!pathname) {
      return `/${targetLocale}`;
    }
    
    const currentLocale = params?.locale;
    
    if (!currentLocale || typeof currentLocale !== 'string') {
      return `/${targetLocale}`;
    }
    
    // Se siamo sulla home page
    if (pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`) {
      return `/${targetLocale}`;
    }
    
    // Per altre pagine, sostituisci la lingua nel path
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    return `/${targetLocale}${pathWithoutLocale}`;
  };

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLocaleChange = (languageCode: string) => {
    setSelectedLocale(languageCode);
    setIsOpen(false);

    // ✅ Verifica che pathname esista prima di usarlo
    if (!pathname) {
      router.push(`/${languageCode}`);
      return;
    }

    // Identifica il tipo di pagina
    const isNewsDetail = pathname.includes('/news/');
    const isBlogDetail = pathname.includes('/blog/');
    const isArticleDetail = pathname.includes('/articles/');

    console.log('🔍 DEBUG LOCALE SWITCHER:');
    console.log('📍 Pathname corrente:', pathname);
    console.log('🎯 Nuovo locale:', languageCode);
    console.log('📰 News detail:', isNewsDetail);
    console.log('✍️ Blog detail:', isBlogDetail);
    console.log('📄 Article detail:', isArticleDetail);

    if (isNewsDetail) {
      router.push(`/${languageCode}/news`);
    } else if (isBlogDetail) {
      router.push(`/${languageCode}/blog`);
    } else if (isArticleDetail) {
      router.push(`/${languageCode}/articles`);
    } else {
      const newPath = buildLocalizedHref(languageCode);
      console.log('🔄 Reindirizzamento a:', newPath);
      router.push(newPath);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md">
        <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors w-full justify-between bg-white"
        onClick={toggleDropdown}
        aria-label={t('change_language')}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900">{currentLanguage?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLocaleChange(language.code)}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                selectedLocale === language.code 
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500' 
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedLocale === language.code && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
                <span className={`font-medium ${selectedLocale === language.code ? 'text-blue-700' : 'text-gray-700'}`}>
                  {language.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{language.abbr}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}