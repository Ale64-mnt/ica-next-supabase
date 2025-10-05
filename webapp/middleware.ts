import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['it', 'en', 'de', 'es', 'fr'],
  defaultLocale: 'it'
});
 
export const config = {
  matcher: ['/', '/(it|en|de|es|fr)/:path*']
};
