export const locales = ['it', 'fr', 'en', 'de', 'es'] as const;
export const defaultLocale = 'it';
export type Locale = (typeof locales)[number];
