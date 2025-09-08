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
