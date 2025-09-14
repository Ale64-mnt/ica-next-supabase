'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabaseBrowser';

// ---------- Helpers per slug univoci ----------
function slugify(s: string) {
  return (s || 'post')
    .toLowerCase()
    .normalize('NFKD')                 // rimuove accenti
    .replace(/[\u0300-\u036f]/g, '')   // mark → base
    .replace(/[^a-z0-9]+/g, '-')       // separatori
    .replace(/(^-|-$)/g, '');          // trim '-'
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  title: string
) {
  const base = slugify(title);
  let slug = base;
  let i = 1;

  // Se esiste, aggiungo -1, -2, ...
  // Usa .maybeSingle() per non lanciare errore quando non trova righe
  // (richiede supabase-js >=2.43; in alternativa controlla data?.length)
  // Qui interroghiamo solo per l'esistenza dello slug
  // e usciamo quando non c'è collisione.
  // NB: se hai un indice unico (slug) o (slug,locale) sei coperto anche a livello DB.
  // Questo while è solo “user friendly”.
  // Evita loop infiniti con guard-rail
  while (i < 500) {
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) break;      // slug libero
    slug = `${base}-${i++}`;
  }

  return slug;
}
// ----------------------------------------------

export default function AdminBlogForm() {
  const supabase = getSupabaseBrowser();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [cover, setCover] = useState<File | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function loadPosts() {
    setError(null);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, cover_url, published_at')
      .order('published_at', { ascending: false })
      .limit(25);

    if (error) setError(error.message);
    setPosts(data ?? []);
  }

  async function uploadCover(file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `blog/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('images').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;

    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  }

  async function savePost() {
    // validazioni minime
    if (!title.trim()) {
      setError('Inserisci un titolo.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let cover_url: string | null = null;
      if (cover) {
        cover_url = await uploadCover(cover);
      }

      // 1) genera slug univoco
      const slug = await generateUniqueSlug(supabase, title);

      // 2) inserisci
      const { error } = await supabase.from('articles').insert({
        title,
        excerpt,      // cambia in "summary" se la colonna si chiama così
        cover_url,
        slug
      });

      if (error) throw error;

      // reset UI
      setTitle('');
      setExcerpt('');
      setCover(null);
      if (fileRef.current) fileRef.current.value = '';

      await loadPosts();
    } catch (e: any) {
      setError(e?.message ?? 'Errore sconosciuto.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 720 }}>
      <h2>Nuovo post</h2>

      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Titolo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          placeholder="Estratto"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={(e) => setCover(e.target.files?.[0] || null)}
        />
        <button onClick={savePost} disabled={saving || !title.trim()}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
        {error && <p style={{ color: 'crimson' }}>Errore: {error}</p>}
      </div>

      <h2>Lista post</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <b>{p.title}</b>
            {p.excerpt ? <> — <i>{p.excerpt}</i></> : null}
            {p.cover_url ? (
              <div>
                <img src={p.cover_url} alt="cover" style={{ maxWidth: 150, display: 'block' }} />
              </div>
            ) : null}
            {p.published_at ? (
              <div style={{ fontSize: 12, color: '#666' }}>
                {new Date(p.published_at).toLocaleString()}
              </div>
            ) : null}
          </li>
        ))}
        {posts.length === 0 && <li>Nessun post presente.</li>}
      </ul>
    </div>
  );
}

