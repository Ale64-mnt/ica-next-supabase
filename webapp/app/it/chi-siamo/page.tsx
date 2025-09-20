// webapp/app/it/chi-siamo/page.tsx
import type { Metadata } from "next";

const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Chi siamo | ICA – Institute for Conscious Action",
  description:
    "Promuoviamo un’educazione finanziaria e digitale eticamente consapevole, accessibile e inclusiva. Strumenti e competenze per decisioni responsabili con impatto sociale.",
  alternates: {
    languages: {
      "it-IT": `${site}/it/chi-siamo`,
      "en-US": `${site}/en/about`,
    },
  },
  openGraph: {
    title: "Chi siamo | ICA – Institute for Conscious Action",
    description:
      "Educazione finanziaria e digitale con etica e inclusione al centro. Formazione, alfabetizzazione, sostenibilità e responsabilità sociale.",
    url: `${site}/it/chi-siamo`,
    type: "article",
    locale: "it_IT",
  },
};

export default function ChiSiamoPage() {
  return (
    <main className="prose mx-auto max-w-3xl px-6 py-10">
      <h1>Chi siamo</h1>

      <p>
        Promuoviamo un’educazione finanziaria e digitale eticamente consapevole,
        accessibile e inclusiva. La nostra missione è fornire strumenti,
        conoscenze e competenze per aiutare persone, professionisti e
        organizzazioni a prendere decisioni più responsabili nell’uso del
        denaro e delle tecnologie digitali, favorendo al tempo stesso
        sostenibilità e responsabilità sociale.
      </p>

      <p>
        Viviamo in un mondo in cui finanza e digitale sono sempre più connessi
        alle scelte quotidiane: dalla gestione dei risparmi alla protezione dei
        dati, dal consumo critico agli investimenti sostenibili. Per questo
        riteniamo fondamentale un approccio che unisca competenza tecnica,
        consapevolezza etica e inclusione sociale, in linea con gli obiettivi
        dell’Unione Europea di riduzione del digital divide e pari opportunità.
      </p>

      <h2>I nostri ambiti principali</h2>
      <ul className="list-disc pl-6">
        <li>Formazione e corsi in educazione finanziaria (base e avanzata)</li>
        <li>Programmi di alfabetizzazione digitale e sicurezza online</li>
        <li>Percorsi di sensibilizzazione su consumo responsabile e finanza sostenibile</li>
        <li>Workshop e consulenze per imprese, scuole e associazioni</li>
      </ul>

      <p>
        Grazie a un team multidisciplinare e a una rete di collaborazioni anche
        a livello europeo, lavoriamo per diffondere una cultura che valorizzi la
        conoscenza come leva di crescita personale e collettiva.
      </p>

      <h2>Il nostro obiettivo</h2>
      <p>
        Semplice ma ambizioso: creare un impatto positivo e misurabile,
        favorendo un futuro più consapevole, sostenibile e inclusivo.
      </p>

      <p className="text-sm opacity-80">
        <strong>Nota</strong>: la nostra missione nasce dagli obiettivi e dagli
        indirizzi strategici della{" "}
        <a
          href="https://digital-strategy.ec.europa.eu/it/policies/digital-education-action-plan"
          target="_blank"
          rel="noopener noreferrer"
        >
          Commissione Europea (Digital Education Action Plan 2021–2027)
        </a>{" "}
        e dei principali{" "}
        <a
          href="https://commission.europa.eu/strategy-and-policy/eu-budget/long-term-eu-budget/2021-2027/programmes/erdf_it"
          target="_blank"
          rel="noopener noreferrer"
        >
          programmi di finanziamento europei
        </a>
        , che promuovono educazione digitale, alfabetizzazione finanziaria,
        sostenibilità e inclusione sociale.
      </p>
    </main>
  );
}
