# Tools/create_pages_scaffold.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]   # cartella del progetto (dove c'è /webapp)
APP = ROOT / "webapp" / "app"
COMP = ROOT / "webapp" / "components"
LIB = ROOT / "webapp" / "lib"

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"✓ {path.relative_to(ROOT)}")

# -----------------------
# Header con navigazione
# -----------------------
HEADER = r"""
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'Chi siamo' },
  { href: '/news', label: 'News' },
  { href: '/articles', label: 'Articoli' },
  { href: '/contact', label: 'Contatti' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">ICA</Link>
        <nav className="flex gap-4 text-sm">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href
                ? 'font-semibold underline underline-offset-4'
                : 'hover:underline underline-offset-4'}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
"""

# -----------------------
# Home page
# -----------------------
HOME = r"""
import Link from 'next/link'

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border p-5 hover:shadow transition">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-neutral-600 mt-1">{desc}</p>
      <span className="inline-block mt-3 text-blue-600 text-sm">Vai →</span>
    </Link>
  )
}

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Benvenuto 👋</h1>
      <p className="text-neutral-700">
        Sito ICA – Institute for Conscious Action. Educazione finanziaria ed etica digitale.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="News" desc="Aggiornamenti e segnalazioni." href="/news" />
        <Card title="Articoli" desc="Approfondimenti ed editoriali." href="/articles" />
      </div>
    </main>
  )
}
"""

# -----------------------
# Pagine statiche
# -----------------------
ABOUT = r"""
export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Chi siamo</h1>
      <p className="text-neutral-700">
        ICA promuove consapevolezza economica ed etica digitale con percorsi formativi
        e contenuti editoriali rivolti a cittadini, studenti e professionisti.
      </p>
    </main>
  )
}
"""

CONTACT = r"""
'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Contatti</h1>
      {sent ? (
        <p className="rounded bg-green-50 border border-green-200 p-3">
          Grazie! Ti risponderemo al più presto.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input className="mt-1 w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input type="email" className="mt-1 w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Messaggio</label>
            <textarea className="mt-1 w-full rounded border px-3 py-2" rows={5} />
          </div>
          <button className="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">Invia</button>
        </form>
      )}
    </main>
  )
}
"""

# -----------------------
# Supabase queries
# -----------------------
QUERIES = r"""
import { createClient } from './supabaseClient'
const supabase = createClient()

export async function fetchNews(lang = 'it') {
  const { data, error } = await supabase
    .from('news')
    .select('id,title,source,source_date,summary,image_url,lang,created_at')
    .eq('lang', lang).eq('published', true)
    .order('source_date', { ascending: false })
    .limit(25)
  if (error) throw error
  return data ?? []
}

export async function fetchNewsById(id: string) {
  const { data, error } = await supabase.from('news').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function fetchArticles(lang = 'it') {
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,subtitle,image_url,lang,created_at')
    .eq('lang', lang).eq('published', true)
    .order('created_at', { ascending: false })
    .limit(25)
  if (error) throw error
  return data ?? []
}

export async function fetchArticleById(id: string) {
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
"""

# -----------------------
# News list + detail
# -----------------------
NEWS_LIST = r"""
import Link from 'next/link'
import Image from 'next/image'
import { fetchNews } from '@/lib/queries'

export const revalidate = 60

export default async function NewsPage() {
  const items = await fetchNews('it')
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">News</h1>
      {items.length === 0 && <p>Nessuna news disponibile.</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map(n => (
          <li key={n.id} className="rounded border p-4">
            {n.image_url && (
              <div className="mb-2 relative aspect-[16/9]">
                <Image src={n.image_url} alt={n.title} fill className="object-cover rounded" />
              </div>
            )}
            <h3 className="font-semibold">{n.title}</h3>
            {n.source && (
              <p className="text-xs text-neutral-600 mt-1">
                Fonte: {n.source} {n.source_date ? `• ${new Date(n.source_date).toLocaleDateString('it-IT')}` : ''}
              </p>
            )}
            {n.summary && <p className="text-sm mt-2">{n.summary}</p>}
            <Link href={`/news/${n.id}`} className="text-blue-600 text-sm mt-2 inline-block">Leggi →</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
"""

NEWS_DETAIL = r"""
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { fetchNewsById } from '@/lib/queries'

type Props = { params: { id: string } }

export default async function NewsDetail({ params }: Props) {
  const item = await fetchNewsById(params.id).catch(() => null)
  if (!item) return notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">{item.title}</h1>
      {item.source && (
        <p className="text-sm text-neutral-600">
          Fonte: {item.source} {item.source_date ? `• ${new Date(item.source_date).toLocaleDateString('it-IT')}` : ''}
        </p>
      )}
      {item.image_url && (
        <div className="relative aspect-[16/9] mt-4">
          <Image src={item.image_url} alt={item.title} fill className="object-cover rounded" />
        </div>
      )}
      {item.summary && <p className="mt-4">{item.summary}</p>}
      {item.body && <article className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: item.body }} />}
    </main>
  )
}
"""

# -----------------------
# Articles list + detail
# -----------------------
ART_LIST = r"""
import Link from 'next/link'
import Image from 'next/image'
import { fetchArticles } from '@/lib/queries'
export const revalidate = 60

export default async function ArticlesPage() {
  const items = await fetchArticles('it')
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Articoli</h1>
      {items.length === 0 && <p>Nessun articolo disponibile.</p>}
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map(a => (
          <li key={a.id} className="rounded border p-4">
            {a.image_url && (
              <div className="mb-2 relative aspect-[16/9]">
                <Image src={a.image_url} alt={a.title} fill className="object-cover rounded" />
              </div>
            )}
            <h3 className="font-semibold">{a.title}</h3>
            {a.subtitle && <p className="text-sm text-neutral-600 mt-1">{a.subtitle}</p>}
            <Link href={`/articles/${a.id}`} className="text-blue-600 text-sm mt-2 inline-block">Leggi →</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
"""

ART_DETAIL = r"""
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { fetchArticleById } from '@/lib/queries'

type Props = { params: { id: string } }

export default async function ArticleDetail({ params }: Props) {
  const item = await fetchArticleById(params.id).catch(() => null)
  if (!item) return notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">{item.title}</h1>
      {item.subtitle && <p className="text-neutral-700">{item.subtitle}</p>}
      {item.image_url && (
        <div className="relative aspect-[16/9] mt-4">
          <Image src={item.image_url} alt={item.title} fill className="object-cover rounded" />
        </div>
      )}
      {item.body && <article className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: item.body }} />}
    </main>
  )
}
"""

def main():
    # components & lib
    write(COMP / "Header.tsx", HEADER)
    write(LIB / "queries.ts", QUERIES)

    # pages
    write(APP / "page.tsx", HOME)
    write(APP / "about" / "page.tsx", ABOUT)
    write(APP / "contact" / "page.tsx", CONTACT)
    write(APP / "news" / "page.tsx", NEWS_LIST)
    write(APP / "news" / "[id]" / "page.tsx", NEWS_DETAIL)
    write(APP / "articles" / "page.tsx", ART_LIST)
    write(APP / "articles" / "[id]" / "page.tsx", ART_DETAIL)

    print("\n✅ Pagine principali e integrazione Supabase generate/aggiornate.")

if __name__ == "__main__":
    main()
