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
