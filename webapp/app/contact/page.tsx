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
