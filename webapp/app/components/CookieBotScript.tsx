// app/components/CookieBotScript.tsx - VERSIONE CORRETTA
"use client";

// 🔥 AGGIUNGI QUESTA DICHIARAZIONE
declare global {
  interface Window {
    Cookiebot?: {
      domain?: string;
      // Aggiungi altre proprietà se le usi
    };
  }
}

import Script from "next/script";
import { usePathname } from "next/navigation";

const CBID = "a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779";
const SUPPORTED_LOCALES = new Set(["it", "en", "fr", "de", "es"]);
const DEFAULT_LOCALE = "en";

function getLocaleFromPath(pathname: string | null): string {
  if (!pathname) return DEFAULT_LOCALE;
  const segment = pathname.split("/")[1]?.toLowerCase() ?? "";
  return SUPPORTED_LOCALES.has(segment) ? segment : DEFAULT_LOCALE;
}

export default function CookieBotScript() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  if (!pathname) return null;

  return (
    <Script
      id="Cookiebot"
      strategy="afterInteractive"
      src="https://consent.cookiebot.com/uc.js"
      data-cbid={CBID}
      data-culture={locale}
      data-blockingmode="auto" // 🔥 MANTIENI "auto"
      onLoad={() => {
        console.log(`✅ Cookiebot loaded (${locale})`);
        // ✅ Ora TypeScript sa che Cookiebot può esistere
        if (window.Cookiebot) {
          window.Cookiebot.domain = "eduethica.eu";
        }
      }}
      onError={(error) => {
        console.error("❌ Cookiebot failed to load", error);
      }}
    />
  );
}