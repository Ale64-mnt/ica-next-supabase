'use client';
import {useEffect, useState} from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

type Article = { id: string; title: string; excerpt?: string; published_at?: string };

export default function ArticlesList() {
  const [data, setData] = useState<Article[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {data, error} = await supabaseBrowser
        .from('articles')
        .select('id,title,excerpt,published_at')
        .order('published_at', {ascending: false})
        .limit(20);

      if (error) setError(error.message);
      else setData(data ?? []);
    })();
  }, []);

  if (error) return <div style={{color:'crimson'}}>Errore nel caricamento degli articoli: {error}</div>;
  if (!data) return <div>Caricamentoâ€¦</div>;
  if (data.length === 0) return <div>Nessun articolo disponibile.</div>;

  return (
    <ul style={{display:'grid', gap:'0.75rem', padding:0, listStyle:'none'}}>
      {data.map(a => (
        <li key={a.id} style={{border:'1px solid #eee', borderRadius:8, padding:'0.75rem'}}>
          <div style={{fontWeight:600}}>{a.title}</div>
          {a.published_at && (
            <div style={{fontSize:12, opacity:0.7}}>
              {new Date(a.published_at).toISOString().slice(0,10)}
            </div>
          )}
          {a.excerpt && <p style={{marginTop:6}}>{a.excerpt}</p>}
        </li>
      ))}
    </ul>
  );
}

