export const locales = ['it','en','fr','es','de'] as const;
export const defaultLocale = 'it';

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const
};