'use client';
import { supabaseBrowser() } from '@/lib/supabaseBrowser()';
﻿'use client';

import { useState, useEffect } from 'react';

export default function AdminNewsForm() {
  const supabase = getSupabaseBrowser();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNews() {
    setError(null);
    const { data, error } = await supabase
      .from('news')
      .select('id, title, summary, published_at')
      .order('published_at', { ascending: false })
      .limit(25);
    if (error) setError(error.message);
    setNews(data ?? []);
  }

  async function saveNews() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // token di protezione lato server (match con .env ADMIN_TOKEN)
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-admin-token-123'
        },
        body: JSON.stringify({title, summary})
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'save failed');
      setTitle('');
      setSummary('');
      await loadNews();
    } catch (e: any) {
      setError(e?.message || 'errore salvataggio');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadNews(); }, []);

  return (
    <div style={{maxWidth: 720}}>
      <h2>Nuova News</h2>

      <div style={{display: 'grid', gap: 8, marginBottom: 12}}>
        <input
          placeholder='Titolo'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{padding: 8, border: '1px solid #ccc', borderRadius: 6}}
        />
        <input
          placeholder='Sommario'
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{padding: 8, border: '1px solid #ccc', borderRadius: 6}}
        />
        <button onClick={saveNews} disabled={saving || !title.trim()}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
        {error && <p style={{color: 'crimson'}}>Errore: {error}</p>}
      </div>

      <h2>Lista News</h2>
      <ul style={{listStyle: 'none', padding: 0}}>
        {news.map((n) => (
          <li key={n.id} style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>
            <b>{n.title}</b>
            {n.summary ? <> — <i>{n.summary}</i></> : null}
            {n.published_at ? (
              <div style={{fontSize: 12, color: '#666'}}>
                {new Date(n.published_at).toLocaleString()}
              </div>
            ) : null}
          </li>
        ))}
        {news.length === 0 && <li>Nessuna news presente.</li>}
      </ul>
    </div>
  );
}