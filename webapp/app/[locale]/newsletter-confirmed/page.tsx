// /app/[locale]/newsletter-confirmed/page.tsx

import { getTranslations } from 'next-intl/server'; // Per ottenere le traduzioni
import { setRequestLocale } from 'next-intl/server'; // Per il rendering statico[citation:5]

// Parametri supportati per la generazione statica
export function generateStaticParams() {
  // Elenca tutte le lingue per cui vuoi pre-renderizzare questa pagina
  return [
    { locale: 'it' },
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'es' }
  ];
}

// Funzione per i metadati tradotti (titolo, descrizione della pagina)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NewsletterConfirmed' }); // Usa il tuo namespace
  return {
    title: t('title'), // Es. "Conferma Iscrizione"
    description: t('description')
  };
}

export default async function NewsletterConfirmedPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  
  // Permette il rendering statico per questa pagina[citation:5]
  setRequestLocale(locale);

  // Carica le traduzioni per questa lingua e namespace
  const t = await getTranslations({ locale, namespace: 'NewsletterConfirmed' });

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('confirmationMessage')}</p>
      {/* Aggiungi qui altri elementi della tua pagina */}
    </main>
  );
}