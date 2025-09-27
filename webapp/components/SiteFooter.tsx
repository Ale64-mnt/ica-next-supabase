"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function SiteFooter() {
  const t = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600">
        © {new Date().getFullYear()} Edunovà — Tutti i diritti riservati.
      </div>

      <nav className="flex justify-center gap-4 mb-3">
        <Link href={`/${locale}/about`}>{t("about")}</Link>
        <Link href={`/${locale}/news`}>{t("news")}</Link>
        <Link href={`/${locale}/contact`}>{t("contact")}</Link>
      </nav>
    </footer>
  );
}
