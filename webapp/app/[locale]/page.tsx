// webapp/app/[locale]/blog/page.tsx

import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server'; 
import Link from 'next/link';
import Image from 'next/image'; 

// Interfaccia che include i campi necessari, inclusi quelli WCAG (image_alt)
interface BlogPost {
  id: number;
  title: string;
  excerpt: string; 
  created_at: string;
  related_article_id: string | null; 
  image_url: string; 
  image_alt: string; 
}

export default async function BlogListPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations('Blog'); 
  const supabase = createClient();

  // RECUPERO DEI DATI DEI POST DEL BLOG (CON FILTRO LOCALE)
  const { data: posts, error } = await supabase
    .from('blog_posts') // Assicurati che il nome della tua tabella sia 'blog_posts'
    .select('id, title, excerpt, related_article_id, created_at, image_url, image_alt')
    .eq('locale', params.locale) // FILTRO ESSENZIALE: mostra solo i post nella lingua corrente
    .order('created_at', { ascending: false }); 

  if (error) {
    console.error('Errore durante il recupero dei post del Blog:', error);
  }
  
  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* WCAG: h1 descrittivo per il titolo della pagina */}
      <h1>{t('title', { default: 'Il Nostro Blog' })}</h1>
      
      {error ? (
        <p style={{ color: 'red' }}>{t('loading_error', { default: 'Errore nel caricamento dei post del Blog.' })}</p>
      ) : posts && posts.length > 0 ? (
        <section style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {posts.map((post) => {
            // Logica di linking: se c'è un articolo correlato (approfondimento), linka lì. Altrimenti, al dettaglio post.
            const destinationHref = post.related_article_id 
              ? `/${params.locale}/articles/${post.related_article_id}` 
              : `/${params.locale}/blog/${post.id}`; 

            return (
              <Link 
                key={post.id} 
                href={destinationHref} 
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', transition: 'box-shadow 0.3s' }}
              >
                {/* WCAG 1: Uso del componente Image e alt obbligatorio */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                    <Image
                        src={post.image_url || '/placeholder.png'} 
                        alt={post.image_alt || `Immagine per ${post.title}`} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 30vw"
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                <div style={{ padding: '15px' }}>
                    <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '0.5rem' }}>
                      {new Date(post.created_at).toLocaleDateString(params.locale)}
                    </p>
                    <h3 style={{ marginTop: 0 }}>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    {/* WCAG 2: Testo del link descrittivo */}
                    <span style={{ color: '#0070f3', fontWeight: 'bold' }}>
                      {post.related_article_id ? t('read_article') : t('read_post')}
                    </span>
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <p>{t('no_posts', { default: 'Nessun post del blog pubblicato al momento.' })}</p>
      )}
    </main>
  );
}
