// webapp/components/SiteHeader.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur"
      role="banner"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3"
            aria-label="Homepage"
          >
            <Image
              src="/logo.png"
              alt="Edunovà"
              width={160}
              height={48}
              priority
              className="h-10 w-auto"
            />
          </Link>

          <nav aria-label="Main" className="flex items-center gap-6 text-sm">
            <Link
              href={`/${locale}/news`}
              className="font-medium text-neutral-700 hover:text-black"
            >
              {t("news")}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="font-medium text-neutral-700 hover:text-black"
            >
              {t("blog")}
            </Link>
            <Link
              href={`/${locale}/chi-siamo`}
              className="font-medium text-neutral-700 hover:text-black"
            >
              {t("about")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
