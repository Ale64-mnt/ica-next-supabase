import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function SupabaseTestPage() {
  const supabase = createClient();
  // Corretto: 'home' con la 'h' minuscola, come nel tuo file .json
  const t = await getTranslations('home'); 

  const { data: articles, error } = await supabase
    .from('articles')
    .select('title');

  if (error) {
    return <pre>Errore di Supabase: {error.message}</pre>
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>{t('title')}</h1>
      <h2>Test di Connessione a Supabase</h2>
      <p>Query eseguita sulla tabella `articles`:</p>
      <pre style={{ background: '#eee', padding: '1rem', borderRadius: '5px' }}>
        {JSON.stringify(articles, null, 2)}
      </pre>
    </main>
  );
}