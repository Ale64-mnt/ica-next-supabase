import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['it', 'en', 'de', 'es', 'fr'],
  defaultLocale: 'it'
});
 
export const config = {
  // Escludi le API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
