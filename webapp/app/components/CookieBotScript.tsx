// app/components/CookieBotScript.tsx
"use client";

import { useEffect, useMemo } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    Cookiebot?: any;
  }
}

const CBID = "a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779";

const SUPPORTED = new Set(["it", "en", "fr", "de", "es"]);
const DEFAULT_LOCALE = "en";

function localeFromPathname(pathname: string | null): string {
  const path = pathname || "/";
  const seg = (path.split("/")[1] || "").toLowerCase();
  return SUPPORTED.has(seg) ? seg : DEFAULT_LOCALE;
}

function removeCookiebotArtifacts() {
  const scriptById = document.getElementById("Cookiebot");
  if (scriptById?.parentNode) scriptById.parentNode.removeChild(scriptById);

  const scriptBySrc = document.querySelector('script[src*="consent.cookiebot.com/uc.js"]');
  if (scriptBySrc?.parentNode) scriptBySrc.parentNode.removeChild(scriptBySrc);

  const dialog = document.getElementById("CybotCookiebotDialog");
  if (dialog?.parentNode) dialog.parentNode.removeChild(dialog);

  const iframe = document.querySelector('iframe[name="Cookiebot"]');
  if (iframe?.parentNode) iframe.parentNode.removeChild(iframe);

  // reset globale
  try {
    // @ts-ignore
    delete window.Cookiebot;
  } catch {
    // @ts-ignore
    window.Cookiebot = undefined;
  }
}

function injectCookiebot(locale: string) {
  // Mantieni <html lang> coerente
  if (document.documentElement.lang !== locale) {
    document.documentElement.lang = locale;
  }

  const s = document.createElement("script");
  s.id = "Cookiebot";
  s.src = "https://consent.cookiebot.com/uc.js";
  s.async = true;

  s.setAttribute("data-cbid", CBID);
  s.setAttribute("data-blockingmode", "manual");
  s.setAttribute("data-culture", locale);

  document.head.appendChild(s);
}

export default function CookieBotScript() {
  const pathname = usePathname();

  const locale = useMemo(() => localeFromPathname(pathname), [pathname]);

  useEffect(() => {
    // Se sei su preview random, puoi bloccare qui come prima (opzionale)
    const hostname = window.location.hostname;
    const isRandomVercelPreview =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
      /-([a-z0-9]+)-ale64-mnts-projects\.vercel\.app$/.test(hostname);

    if (isRandomVercelPreview) {
      console.log("🔄 Skipping Cookiebot on random Vercel preview domain.");
      return;
    }

    console.log(`🌍 Locale route: ${locale} | pathname: ${pathname}`);

    // Hard reset + reinject alla lingua corrente
    removeCookiebotArtifacts();
    injectCookiebot(locale);
  }, [locale, pathname]);

  // Importante: NON caricare anche <Script> di Next, altrimenti doppio load.
  // La reiniezione sopra gestisce tutto.
  return null;
}
