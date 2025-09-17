'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)?.[0] ?? "";
  return (
    <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <button aria-label="Search" className="p-2 rounded hover:bg-gray-100"><IconSearch /></button>
          <Link href={`/${locale || ""}`} className="inline-flex items-center">
            <span className="sr-only">Home</span>
            <Image src="/logo-edunova.png" alt="Edunovà" width={200} height={48} className="h-8 md:h-10 w-auto" priority />
          </Link>
          <button aria-label="Menu" className="p-2 rounded hover:bg-gray-100"><IconMenu /></button>
        </div>
      </div>
    </div>
  );
}
