# -*- coding: utf-8 -*-
"""
pl6e_evergreen_bootstrap.py
Crea una guida evergreen (IT/EN) con SEO avanzata:
- /webapp/app/it/guide/etica-ai/page.tsx
- /webapp/app/en/guide/ai-ethics/page.tsx
Include:
- export const metadata (title, description, openGraph, alternates hreflang)
- JSON-LD BreadcrumbList
Idempotente: non sovrascrive file esistenti.

Exit codes: 0=OK, 2=I/O error
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"

IT_PAGE = WEBAPP / "app" / "it" / "guide" / "etica-ai" / "page.tsx"
EN_PAGE = WEBAPP / "app" / "en" / "guide" / "ai-ethics" / "page.tsx"

IT_TSX = """import type { Metadata } from 'next';

const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');
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
"""

EN_TSX = """import type { Metadata } from 'next';

const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\\/+$/, '');
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
"""

def ensure(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path.relative_to(ROOT)}"

def main() -> int:
    try:
        logs = []
        logs.append(ensure(IT_PAGE, IT_TSX))
        logs.append(ensure(EN_PAGE, EN_TSX))
        print("=== pl6e_evergreen_bootstrap ===")
        for l in logs: print(l)
        return 0
    except Exception as e:
        print("[ERROR]", e)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
