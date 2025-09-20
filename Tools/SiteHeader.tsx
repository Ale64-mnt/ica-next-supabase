// webapp/components/SiteHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();
  // prova a rilevare la locale dal path: "/it/..." => "it"
  const locale = (pathname?.split("/")[1] || "it").toLowerCase();

  return (
    <header className="w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Lente (solo icona, non attiva) */}
          <button
            aria-label="Cerca"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50"
          >
            {/* semplice icona SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
              <path
                fill="currentColor"
                d="m21.53 20.47l-4.7-4.7a7.5 7.5 0 1 0-1.06 1.06l4.7 4.7a.75.75 0 0 0 1.06-1.06M4.5 10.5a6 6 0 1 1 12 0a6 6 0 0 1-12 0"
              />
            </svg>
          </button>

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            {/* usa il tuo logo (es. /logo.png)  — fallback a testo se non c'è */}
            <div className="relative h-9 w-[120px]">
              <Image
                src="/logo.png"
                alt="Edunovà"
                fill
                className="object-contain"
                sizes="120px"
                priority
              />
            </div>
          </Link>

          {/* Menu (icona non attiva per ora) */}
          <button
            aria-label="Menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-80">
              <path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
