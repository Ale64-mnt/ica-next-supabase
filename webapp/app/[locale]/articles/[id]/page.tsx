// webapp/app/[locale]/articles/[id]/page.tsx

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import { notFound } from 'next/navigation';

// Definiamo un'interfaccia per il contenuto completo dell'articolo
interface FullArticle {
  id: number;
  title: string;
  content: string; // Il testo completo dell'articolo
  created_at: string;
  // Aggiungi altri campi utili come 'image_url'
}

// Definiamo le props della pagina
interface ArticlePageProps {
  params: {
    id: string; // L'ID recuperato dall'URL
    locale: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  // Inizializza Supabase e le traduzioni
  const supabase = createClient();
  const t = await getTranslations('Article'); 
  const articleId = params.id;
  
  // --- RECUPERO DEI DATI DELL'ARTICOLO COMPLETO ---
  const { data: article, error } = await supabase
    .from('articles') // ASSICURATI CHE IL NOME DELLA TABELLA SIA 'articles'
    .select('id, title, content, created_at') // Seleziona il campo 'content'
    .eq('id', articleId) // Filtra usando l'ID dinamico
    .single(); // Ci aspettiamo solo un risultato
  
  if (error || !article) {
    console.error("Errore nel recupero dell'articolo:", error || "Articolo non trovato");
    // Se non trova l'articolo, mostra la pagina 404 di Next.js
    notFound(); 
  }
  // --- FINE RECUPERO DATI ---

  // Renderizza il contenuto completo dell'articolo
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Torna Indietro */}
      <a href={`/${params.locale}/`} style={{ display: 'block', marginBottom: '1rem', textDecoration: 'none', color: '#0070f3' }}>
        &larr; Torna alla Homepage
      </a>

      {/* Titolo e Dati */}
      <h1 style={{ marginBottom: '0.5rem' }}>{article.title}</h1>
      <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '2rem' }}>
        Pubblicato il: {new Date(article.created_at).toLocaleDateString(params.locale)}
      </p>

      {/* Contenuto Principale */}
      <div style={{ lineHeight: '1.6' }}>
        <p>{article.content}</p> 
        {/* Nota: Se 'content' è in Markdown, qui potresti voler usare un componente di rendering Markdown. */}
      </div>
    </main>
  );
}