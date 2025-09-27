import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home'); // <-- con la 'h' minuscola
  return <h1>{t('title')}</h1>;
}