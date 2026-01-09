// app/[locale]/contact/page.tsx
import { setRequestLocale } from 'next-intl/server';
import BrevoContactForm from '@/components/BrevoContactForm';

export function generateStaticParams() {
  return [
    { locale: 'it' },
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'es' },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    title:
      locale === 'it'
        ? 'Contatti'
        : locale === 'fr'
        ? 'Contact'
        : locale === 'de'
        ? 'Kontakt'
        : locale === 'es'
        ? 'Contacto'
        : 'Contact',
    description:
      locale === 'it'
        ? 'Parla con il nostro team.'
        : locale === 'fr'
        ? 'Parlez à notre équipe.'
        : locale === 'de'
        ? 'Sprechen Sie mit unserem Team.'
        : locale === 'es'
        ? 'Habla con nuestro equipo.'
        : 'Talk to our team.',
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Necessario per next-intl routing, anche se non usiamo traduzioni qui
  setRequestLocale(locale);

  return (
    <main className="bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <BrevoContactForm />
      </div>
    </main>
  );
}
