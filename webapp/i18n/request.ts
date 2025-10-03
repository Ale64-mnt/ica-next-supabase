import { getRequestConfig } from 'next-intl/server';

// Locales dalla tua struttura messages/ (adatta se hai routing.ts)
const locales = ['de', 'en', 'es', 'fr', 'it'];
const defaultLocale = 'it';

export default getRequestConfig(async ({ requestLocale }) => {
  // Await requestLocale (può essere undefined – essenziale per la migrazione)
  let locale = await requestLocale;

  // Fallback: se undefined o invalido, usa default (previene crash/ricorsione)
  if (!locale || !locales.includes(locale as string)) {
    locale = defaultLocale;
  }

  // Carica messaggi per locale validato
  const messages = (await import(`../messages/${locale}.json`)).default;  // Percorso relativo a messages/

  return {
    locale,  // Obbligatorio: fixa "none was returned"
    messages
  };
});