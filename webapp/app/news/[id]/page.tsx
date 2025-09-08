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
