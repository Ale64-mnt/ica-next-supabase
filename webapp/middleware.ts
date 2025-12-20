import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['it', 'en', 'de', 'es', 'fr'],
  defaultLocale: 'it'
});

export const config = {
  // CRITICO: Escludi API routes con '?!api'
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};