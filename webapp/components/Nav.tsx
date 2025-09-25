"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function getLangFromPath(path: string): string {
  const seg = (path || "/").split("/").filter(Boolean);
  const lang = seg[0];
  return lang === "it" || lang === "en" ? lang : "it";
}

export default function Nav() {
  const pathname = usePathname() || "/";
  const lang = getLangFromPath(pathname);

  return (
    <nav className="p-4 border-b flex gap-4 text-sm">
      <Link href={`/${lang}`} className="hover:underline">Home</Link>
      <Link href={`/${lang}/blog`} className="hover:underline">Blog</Link>
      <Link href={`/${lang}/news`} className="hover:underline">News</Link>
      <Link href={`/${lang}/contact`} className="hover:underline">Contact</Link>
    </nav>
  );
}
