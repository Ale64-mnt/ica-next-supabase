// webapp/app/[locale]/blog/[id]/page.tsx

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import { notFound } from 'next/navigation';
import Link from 'next/link'; 
import Image from 'next/image';

// Interfaccia per il contenuto del singolo post
interface BlogPostContent {
  id: number;
  title: string;
  content: string; 
  created_at: string;
  image_url: string; 
  image_alt: string; 
}

interface BlogPostPageProps {
  params: {
    id: string; // L'ID del post dal percorso URL
    locale: string; 
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Carica le traduzioni per la sezione Blog
  const t = await getTranslations('Blog'); 
  const supabase = createClient();
  const postId = params.id;
  
  // RECUPERO DEI DATI DEL POST COMPLETO (CON FILTRO LOCALE)
  const { data: post, error } = await supabase
    .from('blog_posts') // Tabella dei post del blog
    .select('id, title, content, created_at, image_url, image_alt')
    .eq('id', postId) 
    .eq('locale', params.locale) // FILTRO ESSENZIALE: garantisce che il post sia nella lingua corretta
    .single(); 
  
  if (error || !post) {
    console.error("Errore nel recupero del post:", error || "Post non trovato");
    // Se non trova il post, reindirizza alla pagina 404
    notFound(); 
  }
  
  return (
    <main style={{ padding: '0 0 4rem 0' }}>
      
      {/* Immagine Hero (WCAG 1 & 4 - alt obbligatorio) */}
      <div style={{ position: 'relative', width: '100%', height: '40vh', marginBottom: '3rem' }}>
          {/* Next/Image per ottimizzazione e CLS, con fallback per l'URL */}
          <Image
              src={post.image_url || '/placeholder.png'} 
              alt={post.image_alt || `Immagine Hero per ${post.title}`} 
              fill
              sizes="100vw" 
              priority
              style={{ objectFit: 'cover' }}
          />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Titolo Principale (WCAG 2: H1 descrittivo) */}
        <h1>{post.title}</h1>
        <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '2rem' }}>
          {t('published_on', { default: 'Pubblicato il' })}: {new Date(post.created_at).toLocaleDateString(params.locale)}
        </p>

        {/* Contenuto Principale (WCAG 3: chiarezza del linguaggio) */}
        <div style={{ lineHeight: '1.7', fontSize: '1.1rem' }}>
          {/* Nota: Se il contenuto è in Markdown, qui andrebbe un componente di rendering Markdown */}
          <p>{post.content}</p> 
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <Link 
            href={`/${params.locale}/blog`} 
            style={{ textDecoration: 'none', color: '#0070f3' }}
            // WCAG 2: Assicura che sia accessibile da tastiera
          >
            &larr; {t('back_to_blog', { default: 'Torna al Blog' })}
          </Link>
        </div>
      </div>
    </main>
  );
}
