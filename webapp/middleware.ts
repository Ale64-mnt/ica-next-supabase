// middleware.ts
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/routing';

// Forziamo sempre una locale valida e ignoriamo asset/API
export default createMiddleware({
  locales,
  defaultLocale,
  // se vuoi evitare redirect sulla root, cambia in 'as-needed'
  localePrefix: 'always'
});

export const config = {
  matcher: [
    // Intercetta tutto tranne asset, file statici e API
    '/((?!_next|api|.*\\..*).*)'
  ]
};
