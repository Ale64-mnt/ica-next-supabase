// webapp/app/[locale]/articles/[id]/page.tsx

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import { notFound } from 'next/navigation';

// --- INTERFACCIA AGGIUNTA ---
interface FullArticle {
  id: number;
  title: string;
  content: string; 
  created_at: string;
  // Aggiungi qui gli altri campi che hai in Supabase (es. image_url, image_alt)
}

interface ArticlePageProps {
  params: {
    id: string; 
    locale: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const t = await getTranslations('Article'); 
  const supabase = createClient();
  const articleId = params.id;
  
  // --- RECUPERO DEI DATI DELL'ARTICOLO COMPLETO ---
  const { data: article, error } = await supabase
    .from('articles') // ASSICURATI CHE IL NOME DELLA TABELLA SIA 'articles'
    .select('id, title, content, created_at')
    .eq('id', articleId) 
    .single(); 
  
  if (error || !article) {
    console.error("Errore nel recupero dell'articolo:", error || "Articolo non trovato");
    notFound(); 
  }
  // --- FINE RECUPERO DATI ---

  // Renderizza il contenuto completo dell'articolo
  return (
    <div className="content"> {/* CLASSE AGGIUNTA QUI */}
      
      {/* Utilizzo corretto della traduzione */}
      <a href={`/${params.locale}/`} style={{ display: 'block', marginBottom: '1rem', textDecoration: 'none', color: '#0070f3' }}>
        &larr; {t('back_to_home')}
      </a>

      {/* Titolo e Dati */}
      <h1 style={{ marginBottom: '0.5rem' }}>{article.title}</h1>
      <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '2rem' }}>
        {t('published_on', { default: 'Pubblicato il' })}: {new Date(article.created_at).toLocaleDateString(params.locale)}
      </p>

      {/* Contenuto Principale con stili editoriali */}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      {/* NOTA: Usiamo dangerouslySetInnerHTML perché il contenuto di Supabase può contenere markup HTML/Markdown renderizzato. */}
      
    </div> {/* CHIUSURA DIV.content */}
  );
}
