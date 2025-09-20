import type { Metadata } from 'next';

const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
export const metadata: Metadata = {
  title: 'Guida: Etica dell’Intelligenza Artificiale',
  description: 'Principi fondamentali, rischi e buone pratiche per adottare sistemi di IA in modo responsabile.',
  alternates: { languages: { it: `${site}/it/guide/etica-ai`, en: `${site}/en/guide/ai-ethics` } },
  openGraph: {
    title: 'Guida: Etica dell’Intelligenza Artificiale',
    description: 'Principi fondamentali, rischi e buone pratiche per adottare sistemi di IA in modo responsabile.',
    url: `${site}/it/guide/etica-ai`,
    type: 'article',
    locale: 'it_IT'
  }
};

export default function GuidePage() {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/it` },
      { '@type': 'ListItem', position: 2, name: 'Guide', item: `${site}/it/guide` },
      { '@type': 'ListItem', position: 3, name: 'Etica IA', item: `${site}/it/guide/etica-ai` }
    ]
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <article className="prose">
        <h1>Etica dell’Intelligenza Artificiale</h1>
        <p>
          Questa guida introduce i principi dell’IA responsabile: trasparenza, equità, sicurezza, accountability e rispetto della privacy.
        </p>
        <h2>Perché è importante</h2>
        <p>
          L’adozione dell’IA senza regole può generare bias, violazioni della privacy e decisioni opache. Definire policy e controlli
          riduce i rischi e aumenta la fiducia.
        </p>
        <h2>Buone pratiche chiave</h2>
        <ul>
          <li>Definire obiettivi, dati e metriche di qualità prima dello sviluppo.</li>
          <li>Eseguire valutazioni d’impatto (etico/legale) e test di bias.</li>
          <li>Garantire tracciabilità dei dati e delle versioni dei modelli.</li>
          <li>Prevedere un canale di feedback/appeal per gli utenti.</li>
        </ul>
        <h2>Passi successivi</h2>
        <p>
          Avvia un piccolo progetto pilota con criteri chiari di misurazione e revisione periodica. Documenta tutto.
        </p>
      </article>
    </main>
  );
}
