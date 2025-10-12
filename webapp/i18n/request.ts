// i18n/request.ts - VERSIONE CORRETTA
import { getRequestConfig } from 'next-intl/server';

const locales = ['de', 'en', 'es', 'fr', 'it'];
const defaultLocale = 'it';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as string)) {
    locale = defaultLocale;
  }

  // 🔥 CORREZIONE: Percorso assoluto da root del progetto
  const messages = (await import(`@/app/messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});