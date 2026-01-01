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
    title: t('privacy.meta.title'),
    description: t('privacy.meta.description'),
    alternates: {
      canonical: `/${locale}/privacy-policy`,
      languages: {
        'it': '/it/privacy-policy',
        'en': '/en/privacy-policy',
        'es': '/es/privacy-policy',
        'de': '/de/privacy-policy',
        'fr': '/fr/privacy-policy',
      },
    },
  };
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <PolicyViewer policyType="privacy" />
    </main>
  );
}