import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PolicyViewer } from '@/app/components/policy/PolicyViewer';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Policies' });

  return {
    title: t('cookie.meta.title'),
    description: t('cookie.meta.description'),
    alternates: {
      canonical: `/${locale}/cookie-policy`,
      languages: {
        'it': '/it/cookie-policy',
        'en': '/en/cookie-policy',
        'es': '/es/cookie-policy',
        'de': '/de/cookie-policy',
        'fr': '/fr/cookie-policy',
      },
    },
  };
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <PolicyViewer policyType="cookie" />
    </main>
  );
}