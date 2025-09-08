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
