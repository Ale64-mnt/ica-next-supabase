// app/components/navigation/LocaleSwitcher.client.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export function LocaleSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const t = useTranslations('Common');
  
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'it', name: 'Italiano', abbr: 'IT' },
    { code: 'en', name: 'English', abbr: 'EN' },
    { code: 'de', name: 'Deutsch', abbr: 'DE' },
    { code: 'es', name: 'Español', abbr: 'ES' },
    { code: 'fr', name: 'Français', abbr: 'FR' }
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const currentLocale = isMounted ? (params.locale as string) : 'it';
  const currentLanguage = languages.find(lang => lang.code === currentLocale);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

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
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors w-full justify-between"
        onClick={toggleDropdown}
        aria-label={t('change_language')}
        aria-expanded={isOpen}
      >
        <span>{currentLanguage?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {languages.map((language) => (
            <Link
              key={language.code}
              href={pathname.replace(`/${currentLocale}`, `/${language.code}`)}
              className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                currentLocale === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
              onClick={closeDropdown}
            >
              <span className="font-medium">{language.name}</span>
              <span className="text-xs text-gray-500 font-mono">{language.abbr}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}