// RIMUOVI "use client" - rendilo un Server Component
import { getLocale } from 'next-intl/server'; // Usa getLocale per server components

const CBID = "a6a8c0e0-b4e4-498d-8fd9-f8f2b24bd779";

const CULTURE_MAP: Record<string, string> = {
  it: "it",
  en: "en",
  fr: "fr",
  es: "es",
  de: "de",
};

export default async function CookieBotScript() {
  // Ottieni la lingua dal server (funziona anche per la root "/")
  const locale = await getLocale();
  const culture = CULTURE_MAP[locale] || "en";

  return (
    <script
      id="Cookiebot_uc"
      src={`https://consent.cookiebot.com/uc.js?cbid=${CBID}&culture=${culture}`}
      data-cbid={CBID}
      data-culture={culture}
      data-blockingmode="auto"
      async
      // 🔥 IMPORTANTE: Sopprime l'errore di hydration
      suppressHydrationWarning
    />
  );
}