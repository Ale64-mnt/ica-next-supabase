// webapp/app/[locale]/page.tsx

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import Link from 'next/link'; // <--- AGGIUNTO L'IMPORT DI LINK

interface Article {
  id: number;
  title: string;
}

// Aggiornata la definizione della funzione per accettare i parametri di routing
export default async function HomePage({ params }: { params: { locale: string } }) {
  const supabase = createClient();
  const t = await getTranslations('Index'); 

  // --- LOGICA DI RECUPERO DATI DA SUPABASE ---
  const { data: articles, error } = await supabase
    .from('articles') // ASSICURATI CHE 'articles' SIA IL NOME CORRETTO DELLA TUA TABELLA
    .select('id, title') 
    .limit(3); 
    
  if (error) {
    console.error('Errore durante il recupero degli articoli:', error);
  }
  // --- FINE LOGICA DI RECUPERO DATI ---


  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>{t('title')}</h1> 

      {/* Sezione Articoli Dinamici */}
      <h2>Scopri i nostri ultimi articoli.</h2>
      
      {error ? (
        <p style={{ color: 'red' }}>Non è stato possibile caricare gli articoli: {error.message}</p>
      ) : articles && articles.length > 0 ? (
        // Mappa i dati recuperati per visualizzare gli articoli
        <section>
          {articles.map((article) => (
            // Utilizza il componente Link per il routing dinamico
            <Link 
              key={article.id} 
              // Costruisce l'URL: /it/articles/123 o /en/articles/123
              href={`/${params.locale}/articles/${article.id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                style={{ border: '1px solid #eee', margin: '10px 0', padding: '10px', borderRadius: '5px' }}
              >
                <h3>{article.title}</h3>
                <p style={{ color: '#0070f3' }}>Leggi l'articolo completo &rarr;</p>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <p>Nessun articolo pubblicato al momento (verifica la tua tabella 'articles' su Supabase).</p>
      )}

      {/* Link Statici */}
      <div style={{ marginTop: '20px' }}>
        <p>HomeBlogNewsContact</p>
      </div>
    </main>
  );
}
