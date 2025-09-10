import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

// Intercetta tutto tranne asset statici, API, _next e _vercel
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
