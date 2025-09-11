'use client';

import {useTranslations} from 'next-intl';

export default function HomeContent() {
  const t = useTranslations('home');
  return (
    <main className="container" style={{padding: '2rem'}}>
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>
    </main>
  );
}
