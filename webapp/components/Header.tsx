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
