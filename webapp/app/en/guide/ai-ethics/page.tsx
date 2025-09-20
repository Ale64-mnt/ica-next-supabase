import type { Metadata } from 'next';

const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
export const metadata: Metadata = {
  title: 'Guide: AI Ethics',
  description: 'Core principles, risks and best practices to adopt AI systems responsibly.',
  alternates: { languages: { en: `${site}/en/guide/ai-ethics`, it: `${site}/it/guide/etica-ai` } },
  openGraph: {
    title: 'Guide: AI Ethics',
    description: 'Core principles, risks and best practices to adopt AI systems responsibly.',
    url: `${site}/en/guide/ai-ethics`,
    type: 'article',
    locale: 'en_US'
  }
};

export default function GuidePage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/en` },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${site}/en/guide` },
      { '@type': 'ListItem', position: 3, name: 'AI Ethics', item: `${site}/en/guide/ai-ethics` }
    ]
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <article className="prose">
        <h1>AI Ethics</h1>
        <p>
          This guide introduces responsible AI principles: transparency, fairness, safety, accountability and privacy.
        </p>
        <h2>Why it matters</h2>
        <p>
          Unregulated AI adoption can cause bias, privacy violations and opaque decisions. Policies and controls reduce risks and build trust.
        </p>
        <h2>Key best practices</h2>
        <ul>
          <li>Define objectives, data and quality metrics before building.</li>
          <li>Run impact assessments (ethical/legal) and bias testing.</li>
          <li>Ensure data/model version traceability.</li>
          <li>Provide a feedback/appeal channel for users.</li>
        </ul>
        <h2>Next steps</h2>
        <p>
          Start a small pilot with clear success criteria and regular reviews. Document everything.
        </p>
      </article>
    </main>
  );
}
