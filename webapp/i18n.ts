import { getRequestConfig } from 'next-intl/server';
 
// L'unica soluzione stabile attuale è ricevere la locale come parametro
export default getRequestConfig(async ({ locale }) => {
  // ⚠️ Ritorno temporaneo al metodo legacy ({locale}) per evitare TypeError.
  // La correzione sarà definitiva quando 'requestLocale' verrà esportato correttamente.
  
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
});
