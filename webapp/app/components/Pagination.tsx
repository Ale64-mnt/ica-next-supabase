'use client';
import Link from 'next/link';

export default function Pagination({ current, totalPages, basePath }: { current: number; totalPages: number; basePath: string }) {
  const prev = current > 0 ? current - 1 : 0;
  const next = current + 1 < totalPages ? current + 1 : current;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      <Link
        aria-disabled={current === 0}
        className={`rounded-xl border px-3 py-2 text-sm ${current === 0 ? 'pointer-events-none opacity-50' : ''}`}
        href={`${basePath}?page=${prev}`}
      >
        ◀ Prev
      </Link>

      <span className="text-sm">{current + 1} / {totalPages}</span>

      <Link
        aria-disabled={current + 1 >= totalPages}
        className={`rounded-xl border px-3 py-2 text-sm ${current + 1 >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
        href={`${basePath}?page=${next}`}
      >
        Next ▶
      </Link>
    </nav>
  );
}
