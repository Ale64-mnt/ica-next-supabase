"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Cookiebot?: {
      show?: () => void;
      hide?: () => void;
      renew?: () => void;
    };
    __cookiebot_loading__?: boolean;
    __cookiebot_loaded__?: boolean;
    __cookiebot_culture__?: string;
  }
}

const CBID = "a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779";

const CULTURE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  fr: "fr",
  es: "es",
  de: "de",
};

function detectCulture(pathname: string | null): string {
  if (!pathname) return "en";
  const segment = pathname.split("/")[1]?.toLowerCase();
  return CULTURE_MAP[segment] ?? "en";
}

function findCookiebotScript(): HTMLScriptElement | null {
  return (
    document.querySelector('script[data-cbid]') ||
    document.querySelector('script[src*="consent.cookiebot.com/uc.js"]') ||
    null
  ) as HTMLScriptElement | null;
}

export default function CookieBotScript() {
  const pathname = usePathname();

  // Ora supporta QUALSIASI lingua della mappa
  const cultureRef = useRef<string>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const culture = detectCulture(pathname);
    cultureRef.current = culture;

    // Evita doppio caricamento in StrictMode
    if (window.__cookiebot_loading__) return;

    const existing = findCookiebotScript();
    if (existing) {
      window.__cookiebot_loaded__ = true;

      const existingCulture =
        existing.getAttribute("data-culture") ?? "en";

      window.__cookiebot_culture__ = existingCulture;

      // Cookiebot NON cambia lingua a caldo
      if (existingCulture !== culture) {
        // comportamento corretto: reload hard se vuoi lingua coerente
        // location.reload();
      } else {
        setTimeout(() => {
          if (window.Cookiebot?.show) {
            window.Cookiebot.show();
          }
        }, 100);
      }
      return;
    }

    console.log(`🌐 Carico CookieBot per: ${culture}`);
    window.__cookiebot_loading__ = true;

    const script = document.createElement("script");
    script.id = "Cookiebot_uc";
    script.src = `https://consent.cookiebot.com/uc.js?cbid=${CBID}&culture=${culture}`;
    script.async = true;

    script.setAttribute("data-cbid", CBID);
    script.setAttribute("data-culture", culture);
    script.setAttribute("data-blockingmode", "manual");

    script.onload = () => {
      window.__cookiebot_loading__ = false;
      window.__cookiebot_loaded__ = true;
      window.__cookiebot_culture__ = culture;

      console.log(`✅ CookieBot caricato in ${culture}`);

      setTimeout(() => {
        if (window.Cookiebot?.show) {
          console.log(`🎪 Mostro banner in ${culture}`);
          window.Cookiebot.show();
        }
      }, 150);
    };

    script.onerror = () => {
      window.__cookiebot_loading__ = false;
      console.error("❌ Errore caricamento CookieBot");
    };

    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
