// webapp/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

export const locales = ['it', 'en'] as const;
export type SupportedLocale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  // forza sempre una stringa valida
  const loc: SupportedLocale = locales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'it';

  // prova a caricare i messaggi della locale scelta,
  // altrimenti ripiega su 'it'
  try {
    const mod: {default: AbstractIntlMessages} = await import(`../messages/${loc}.json`);
    return {locale: loc, messages: mod.default};
  } catch {
    const mod: {default: AbstractIntlMessages} = await import(`../messages/it.json`);
    return {locale: 'it', messages: mod.default};
  }
});
