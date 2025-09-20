import { useTranslations } from "next-intl";
// webapp/components/SiteHeader.tsx
import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Homepage">
            <Image
              src="/logo.png"
              alt="Edunovà"
              width={160}        // ⬅️ dimensioni fisse
              height={48}
              priority
              className="h-10 w-auto" // ⬅️ controlla l’altezza visiva
            />
          </Link>

          <nav aria-label="Main" className="flex items-center gap-4">
            {/* link placeholder, da popolare più avanti */}
            <Link href="/it/news" className="text-sm font-medium text-neutral-700 hover:text-black">
              News
            </Link>
            <Link href="/it/blog" className="text-sm font-medium text-neutral-700 hover:text-black">
              Blog
            </Link>
            <Link href="/it/about" className="text-sm font-medium text-neutral-700 hover:text-black">
              Chi siamo
            </Link>
          
  <ul className="flex gap-6 text-sm">
    <li><Link href="/[locale]/chi-siamo" locale>{t("about")}</Link></li>
  </ul>
</nav>
        </div>
      </div>
    </header>
  );
}
