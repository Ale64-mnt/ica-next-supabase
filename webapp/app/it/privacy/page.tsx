export const dynamic = 'force-static';
export default function PrivacyIt() {
  return (
    <section className="prose max-w-3xl">
      <h1>Informativa Privacy (MVP)</h1>
      <p>Questa pagina descrive in sintesi il trattamento dati per il pre-lancio.</p>
      <h2>Titolare</h2>
      <p>Institute for Conscious Action (ICA) — contatti: info@example.org</p>
      <h2>Dati trattati</h2>
      <ul>
        <li>Log tecnici e dati necessari al funzionamento del sito.</li>
        <li>Email fornita per la newsletter (se compilata).</li>
        <li>Metriche anonime (se GA4 attivo).</li>
      </ul>
      <h2>Diritti</h2>
      <p>Puoi richiedere accesso/cancellazione scrivendo all’indirizzo sopra.</p>
      <p>Versione minimale per MVP — sarà estesa alla messa in produzione.</p>
    </section>
  );
}
