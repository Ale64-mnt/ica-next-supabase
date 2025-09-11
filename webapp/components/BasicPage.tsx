'use client';
import {useTranslations} from 'next-intl';

export default function BasicPage({ns}:{ns:string}) {
  const t = useTranslations(ns);
  return (
    <main className="container" style={{padding:'2rem'}}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
    </main>
  );
}
