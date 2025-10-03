// in: webapp/middleware.ts

import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // Lista delle tue lingue
  locales: ['it', 'en'], // Assicurati che queste siano le tue lingue
 
  // La tua lingua di default
  defaultLocale: 'it'
});
 
export const config = {
  /*
   * Questo matcher è la soluzione.
   * Dice al middleware di attivarsi SOLO per la pagina principale ('/')
   * e per i percorsi che iniziano con una delle tue lingue (es. /it/blog, /en/about).
   * Ignora tutti gli altri percorsi, come le risorse interne di Next.js (_next),
   * interrompendo così il loop infinito.
   */
  matcher: ['/', '/(it|en)/:path*'] // Assicurati che le lingue qui corrispondano a quelle nella lista 'locales'
};