'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {locales} from '@/i18n/routing';

export default function LanguageSwitcher(){
  const pathname = usePathname() || '/it';
  // rimuovi il primo segmento /xx
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
  return (
    <div style={{display:'flex', gap:'0.5rem'}}>
      {locales.map(l => (
        <Link key={l} href={`/${l}${rest || ''}`}>{l.toUpperCase()}</Link>
      ))}
    </div>
  );
}
