// /app/[locale]/newsletter-confirmed/page.tsx

import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/navigation/Header'; // Importa l'Header
import Footer from '@/components/navigation/Footer'; // Importa il Footer

export function generateStaticParams() {
  return [
    { locale: 'it' }, { locale: 'en' }, { locale: 'fr' }, { locale: 'de' }, { locale: 'es' }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'NewsletterConfirmed' });
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function NewsletterConfirmedPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NewsletterConfirmed' });

  // Testi per il pulsante "Torna alla Home" in base alla lingua
  const backButtonText = {
    it: 'Torna alla Home',
    en: 'Back to Home', 
    fr: 'Retour à l\'Accueil',
    de: 'Zurück zur Startseite',
    es: 'Volver al Inicio'
  }[locale];

  return (
    <>
      {/* 🔹 INTESTAZIONE DEL SITO */}
      <Header locale={locale} />
      
      {/* 🔹 CONTENUTO PRINCIPALE CON FORMATTAZIONE MIGLIORATA */}
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full max-w-2xl mx-auto text-center">
          
          {/* 🔸 ICONA DI CONFERMA (ELEMENTO VISIVO) */}
          <div className="mb-10 animate-fade-in">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 shadow-lg">
              <svg 
                className="h-14 w-14 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth="2"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          {/* 🔸 TITOLO CENTRATO CON STILE MIGLIORATO */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {t('title')}
          </h1>
          
          {/* 🔸 MESSAGGIO DI CONFERMA CON FORMATTAZIONE LEGGIBILE */}
          <div className="mb-12">
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto font-light">
              {t('confirmationMessage')}
            </p>
            
            {/* 🔸 SEPARATORE VISIVO */}
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full opacity-70"></div>
          </div>
          
          {/* 🔸 PULSANTE PER TORNARE ALLA HOME */}
          <div className="mb-16">
            <a 
              href={`/${locale}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg 
                className="w-5 h-5 mr-3" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              {backButtonText}
            </a>
          </div>
          
          {/* 🔸 MESSAGGIO AGGIUNTIVO PER L'UTENTE */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg text-left max-w-xl mx-auto">
            <div className="flex">
              <svg 
                className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  {locale === 'it' && 'Cosa succede ora?'}
                  {locale === 'en' && 'What happens next?'}
                  {locale === 'fr' && 'Que se passe-t-il maintenant ?'}
                  {locale === 'de' && 'Was passiert jetzt?'}
                  {locale === 'es' && '¿Qué pasa ahora?'}
                </p>
                <p className="text-gray-600 text-sm">
                  {locale === 'it' && 'Ti invieremo aggiornamenti e contenuti esclusivi nella tua email. Puoi annullare l\'iscrizione in qualsiasi momento.'}
                  {locale === 'en' && 'We\'ll send you updates and exclusive content to your email. You can unsubscribe at any time.'}
                  {locale === 'fr' && 'Nous vous enverrons des mises à jour et du contenu exclusif par e-mail. Vous pouvez vous désabonner à tout moment.'}
                  {locale === 'de' && 'Wir senden Ihnen Updates und exklusive Inhalte per E-Mail. Sie können sich jederzeit abmelden.'}
                  {locale === 'es' && 'Te enviaremos actualizaciones y contenido exclusivo a tu correo electrónico. Puedes darte de baja en cualquier momento.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* 🔹 FOOTER DEL SITO */}
      <Footer locale={locale} />
    </>
  );
}