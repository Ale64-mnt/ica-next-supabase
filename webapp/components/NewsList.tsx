'use client';
import {useEffect, useState} from 'react';
import {supabaseBrowser} from '@/lib/supabaseBrowser';

type News = { id: string; title: string; summary?: string; published_at?: string };

export default function NewsList() {
  const [data, setData] = useState<News[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {data, error} = await supabaseBrowser
        .from('news')
        .select('id,title,summary,published_at')
        .order('published_at', {ascending: false})
        .limit(20);

      if (error) setError(error.message);
      else setData(data ?? []);
    })();
  }, []);

  if (error) return <div style={{color:'crimson'}}>Errore nel caricamento delle news: {error}</div>;
  if (!data) return <div>Caricamento…</div>;
  if (data.length === 0) return <div>Nessuna news disponibile.</div>;

  return (
    <ul style={{display:'grid', gap:'0.75rem', padding:0, listStyle:'none'}}>
      {data.map(n => (
        <li key={n.id} style={{border:'1px solid #eee', borderRadius:8, padding:'0.75rem'}}>
          <div style={{fontWeight:600}}>{n.title}</div>
          {n.published_at && (
            <div style={{fontSize:12, opacity:0.7}}>
              {new Date(n.published_at).toISOString().slice(0,10)}
            </div>
          )}
          {n.summary && <p style={{marginTop:6}}>{n.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
