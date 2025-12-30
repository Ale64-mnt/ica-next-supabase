// app/components/CookieBotScript.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface CookiebotObject {
  hasResponse?: boolean;
  culture?: string;
  domain?: string;
  runScripts?: () => void;
}

declare global {
  interface Window {
    Cookiebot?: CookiebotObject;
  }
}

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
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const localeRef = useRef<string>(DEFAULT_LOCALE);
  const firstMount = useRef(true);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isPreview =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
      /-([a-z0-9]+)-ale64-mnts-projects\.vercel\.app$/.test(hostname);

    if (isPreview) {
      console.log("🔄 Cookiebot skipped (preview)");
      return;
    }

    const locale = getLocaleFromPath(pathname);

    if (!firstMount.current && locale === localeRef.current) {
      return;
    }

    localeRef.current = locale;

    document.documentElement.lang = locale;

    // Cleanup completo
    scriptRef.current?.remove();
    scriptRef.current = null;

    document.getElementById("CybotCookiebotDialog")?.remove();
    document.querySelector('iframe[name="Cookiebot"]')?.remove();
    delete (window as any).Cookiebot;

    const script = document.createElement("script");
    script.id = "Cookiebot";
    script.src = "https://consent.cookiebot.com/uc.js";
    script.async = true;
    script.setAttribute("data-cbid", CBID);
    script.setAttribute("data-culture", locale);
    script.setAttribute("data-blockingmode", "manual");

    script.onload = () => {
      const cb = window.Cookiebot;
      if (!cb) return;

      cb.domain = "eduethica.eu";

      // ❗️NESSUN renew ❗️
      // Cookiebot mostrerà il banner automaticamente se necessario
      if (!cb.hasResponse && typeof cb.runScripts === "function") {
        cb.runScripts();
      }

      console.log(`✅ Cookiebot ready (${locale})`);
    };

    script.onerror = (err) => {
      console.error("❌ Cookiebot load error", err);
    };

    document.head.appendChild(script);
    scriptRef.current = script;
    firstMount.current = false;

    return () => {
      scriptRef.current?.remove();
    };
  }, [pathname]);

  return null;
}
