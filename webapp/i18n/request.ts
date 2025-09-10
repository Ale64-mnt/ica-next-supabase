// webapp/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // requestLocale è una Promise in next-intl v4: serve await
  let locale = await requestLocale;

  // Fallback alla defaultLocale se la locale non è supportata
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Importa il file di messaggi corretto (cartella: webapp/messages)
  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
