import {defineConfig} from 'next-intl';

export default defineConfig({
  locales: ['it','en','fr','es','de'],
  defaultLocale: 'it',
  localePrefix: 'always'
});