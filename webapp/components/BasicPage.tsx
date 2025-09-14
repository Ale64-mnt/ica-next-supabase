// components/BasicPage.tsx
'use client';

import {ReactNode} from 'react';
import {useTranslations} from 'next-intl';

type Props = {
  title?: string;      // testo già risolto (opzionale)
  intro?: string;      // testo già risolto (opzionale)
  namespace?: string;  // facoltativo per eventuale fallback
  children?: ReactNode;
};

export default function BasicPage({title, intro, namespace, children}: Props) {
  // Se servono fallback, usa il namespace passato; altrimenti non tradurre
  const t = namespace ? useTranslations(namespace) : null;

  const resolvedTitle = title ?? (t ? t('title') : '');
  const resolvedIntro = intro ?? (t ? t('intro') : '');

  return (
    <main className="container" style={{padding: '2rem'}}>
      {resolvedTitle && <h1>{resolvedTitle}</h1>}
      {resolvedIntro && <p>{resolvedIntro}</p>}
      {children}
    </main>
  );
}
