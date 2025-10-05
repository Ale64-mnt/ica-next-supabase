import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('Index');
  
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('title')}</h1>
      <p>Homepage - Menu di navigazione allineato e funzionante!</p>
      <div>
        <h2>Menu di navigazione test:</h2>
        <ul>
          <li>Home - dovrebbe essere tradotta</li>
          <li>Articoli/Articles - dovrebbe essere tradotta</li>
          <li>News - dovrebbe essere tradotta</li>
          <li>Blog - dovrebbe essere tradotta</li>
        </ul>
      </div>
    </div>
  );
}
