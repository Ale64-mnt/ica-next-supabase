import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['it', 'en'],
  defaultLocale: 'it'
});
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};