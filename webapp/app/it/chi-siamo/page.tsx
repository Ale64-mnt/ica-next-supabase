import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Chi siamo | ICA – Institute for Conscious Action",
  description:
    "Promuoviamo un’educazione finanziaria e digitale eticamente consapevole, accessibile e inclusiva. La nostra missione è fornire strumenti e competenze per decisioni responsabili.",
  alternates: {
    languages: {
      it: "/it/chi-siamo",
      en: "/en/about",
    },
  },
  openGraph: {
    title: "Chi siamo | ICA – Institute for Conscious Action",
    description:
      "Educazione finanziaria e digitale etica, accessibile e inclusiva. Strumenti, conoscenze e competenze per decisioni responsabili.",
    url: "/it/chi-siamo",
    siteName: "ICA – Institute for Conscious Action",
    type: "website",
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/it",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Chi siamo",
        item: "/it/chi-siamo",
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="mb-3">Chi siamo</h1>

      <p>
        Promuoviamo un’educazione finanziaria e digitale eticamente
        consapevole, accessibile e inclusiva. La nostra missione è fornire
        strumenti, conoscenze e competenze per aiutare persone, professionisti e
        organizzazioni a prendere decisioni più responsabili nell’uso del denaro
        e delle tecnologie digitali, favorendo al tempo stesso sostenibilità e
        responsabilità sociale.
      </p>

      <p>
        Viviamo in un mondo in cui finanza e digitale sono sempre più connessi
        alle scelte quotidiane: dalla gestione dei risparmi alla protezione dei
        dati, dal consumo critico agli investimenti sostenibili. Per questo
        riteniamo fondamentale un approccio che unisca competenza tecnica,
        consapevolezza etica e inclusione sociale, in linea con gli obiettivi
        europei di riduzione del digital divide e pari opportunità.
      </p>

      <h2>I nostri ambiti principali</h2>
      <ul>
        <li>
          Formazione e corsi su educazione finanziaria di base e avanzata
        </li>
        <li>Programmi di alfabetizzazione digitale e sicurezza online</li>
        <li>
          Percorsi di sensibilizzazione su consumo responsabile e finanza
          sostenibile
        </li>
        <li>Workshop e consulenze per imprese, scuole e associazioni</li>
      </ul>

      <p>
        Grazie a un team multidisciplinare e a una rete di collaborazioni anche
        a livello europeo, lavoriamo per diffondere una cultura che valorizzi la
        conoscenza come leva di crescita personale e collettiva.
      </p>

      <p>
        <strong>Il nostro obiettivo</strong> è semplice ma ambizioso: creare un
        impatto positivo e misurabile, favorendo un futuro più consapevole,
        sostenibile e inclusivo.
      </p>

      <p>
        <strong>Nota</strong>: la nostra missione si ispira ed è in continuità
        con gli <strong>obiettivi strategici della Commissione Europea</strong>,
        che promuovono educazione digitale, competenze finanziarie di base,
        sostenibilità e inclusione sociale.
      </p>
    </main>
  );
}
