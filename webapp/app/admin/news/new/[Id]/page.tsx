'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AdminGuard from '@/components/AdminGuard'
import { uploadImage } from '@/lib/upload'

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [lang, setLang] = useState('it')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [publ, setPubl] = useState(false)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
      if (error) { setErr(error.message); setLoading(false); return }
      setTitle(data.title ?? '')
      setSummary(data.summary ?? '')
      setBody(data.body ?? '')
      setSource(data.source ?? '')
      setSourceUrl(data.source_url ?? '')
      setLang(data.lang ?? 'it')
      setImageUrl(data.image_url ?? null)
      setPubl(!!data.published_at)
      setLoading(false)
    })()
  }, [id])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const url = await uploadImage(f)
      setImageUrl(url)
    } catch (e: any) {
      setErr(e.message)
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setErr(null)
    try {
      const { error } = await supabase.from('news').update({
        title, summary, body, source, source_url: sourceUrl,
        lang, image_url: imageUrl, published_at: publ ? new Date().toISOString() : null
      }).eq('id', id)
      if (error) throw error
      router.replace('/admin/news')
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!confirm('Eliminare questa news?')) return
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (!error) router.replace('/admin/news')
  }

  if (loading) return <p>Caricamento…</p>
  if (err) return <p style={{color:'crimson'}}>Errore: {err}</p>

  return (
    <AdminGuard>
      <h1>Modifica news</h1>
      <form className="card" onSubmit={onSave} style={{display:'grid', gap:12, maxWidth:800}}>
        <label>Titolo<input required value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%'}}/></label>
        <label>Lingua
          <select value={lang} onChange={e=>setLang(e.target.value)}>
            <option>it</option><option>en</option><option>fr</option><option>de</option><option>es</option>
          </select>
        </label>
        <label>Summary<textarea value={summary} onChange={e=>setSummary(e.target.value)} rows={3} style={{width:'100%'}}/></label>
        <label>Body (markdown)<textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} style={{width:'100%'}}/></label>
        <label>Fonte<input value={source} onChange={e=>setSource(e.target.value)} /></label>
        <label>URL fonte<input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} /></label>
        <label>Immagine <input type="file" accept="image/*" onChange={onUpload} /></label>
        {imageUrl && <p style={{fontSize:12,color:'#555'}}>attuale: {imageUrl}</p>}
        <label><input type="checkbox" checked={publ} onChange={e=>setPubl(e.target.checked)} /> Pubblica</label>

        <div style={{display:'flex', gap:8}}>
          <button className="btn" disabled={saving}>{saving ? 'Salvo…' : 'Salva'}</button>
          <button type="button" className="btn" onClick={onDelete} style={{background:'#ef4444'}}>Elimina</button>
        </div>
      </form>
    </AdminGuard>
  )
}
