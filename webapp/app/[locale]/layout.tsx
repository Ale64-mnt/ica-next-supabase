// app/[locale]/layout.tsx
import "../globals.css";

import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { locales } from "@/i18n/routing";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/** Pre-render di /it, /en, /fr, /es, /de */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Attiva la locale per next-intl
  setRequestLocale(locale);

  // 404 se la lingua non è supportata
  if (!locales.includes(locale as any)) notFound();

  // Carica i messaggi della lingua (con fallback)
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    // Fallback di sicurezza: prova l'inglese o fallisci con 404
    try {
      messages = (await import(`@/messages/en.json`)).default;
    } catch {
      notFound();
    }
  }

  return (
    <html lang={locale} className="antialiased">
      <body className="min-h-screen bg-[#f7f4eb] text-neutral-900 flex flex-col">
        {/* Header fisso in alto alla colonna */}
        <SiteHeader />

        {/* Contenuto: container centrale responsivo */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <main className="container mx-auto max-w-6xl w-full flex-1 px-4 sm:px-6">
            {children}
          </main>
        </NextIntlClientProvider>

        {/* Footer ancorato in fondo grazie a flex-col + flex-1 su main */}
        <SiteFooter />
      </body>
    </html>
  );
}
