# Worklog – ICA Next.js + Supabase

### 📌 2025-09-10 – Bootstrap – Primo log di prova
- Inizializzazione repo e ambiente
⏱ 10m

### 📌 2025-09-10 – Fix i18n – next-intl v4, middleware, routing, request.ts
- Configurazione i18n base e middlewares
⏱ 40m

### 📌 2025-09-11 – Fase 2 – layout.tsx, messaggi base, test /it /en
- Implementazione layout e messaggi; smoke test lingue
⏱ 1h 15m

### 📌 2025-09-11 – Commit fase 3 – salvataggio componenti e messaggi
- Git snapshot (Navbar, LanguageSwitcher, pagine, messaggi)
⏱ 5m

### 📌 2025-09-12 – Fase 4 – Integrazione Supabase
- News & articles online (lettura pubblica)
⏱ 20m

### 📌 2025-09-12 – Admin News – create news con service_role
- Route server-side sicura; form creazione news
⏱ 1h

### 📌 2025-09-14 – Admin Blog – sezione traduzioni
- Creata sezione Admin Blog con gestione traduzioni
⏱ 2h 5m

### 📌 2025-09-14 – Admin Blog base – upload cover, slug unico, lista post
- Form editoriale; policy DEV temporanea
⏱ 2h 45m

### 📌 2025-09-14 – Fix variabili ambiente + /api/debug-env
- Corretto .env.local, route di diagnostica
⏱ 15m

### 📌 2025-09-14 – Admin Blog hardening – RLS
- Rimosse policy anon CRUD; rimane SELECT pubblica
⏱ 20m

### 📌 2025-09-15 – Blog multilingua – JSON i18n aggiornati
- it/en/es/fr/de; rimossi BOM
⏱ 15m

### 📌 2025-09-15 – PL-2 News pubblico – dettaglio /news/[slug]
- Fix i18n; seed SQL
⏱ 50m

### 📌 2025-09-17 – PL-4 News/Blog – formattazione editoriale
- Titolo, badge categoria, cover, summary, body Markdown; fix slug duplicati; debug rendering
⏱ 1h 55m

### 📌 2025-09-17 – PL-5b – Integrazione SiteHeader/SiteFooter
- Inseriti nel layout principale
⏱ 40m

### 📌 2025-09-18 – PL-5b – Pulizia EditorialLayout + home + logo
- Test `pl5b_verify` ✅
⏱ 3h

### 📌 2025-09-19 – PL-6f – Fix NewsList
- Rewrite completo + `supabaseBrowser.ts`
⏱ 1h

### 📌 2025-09-19 – PL-6e – Evergreen “AI Ethics” (it/en)
- Metadata avanzati (title/description/OG, hreflang, breadcrumbs); test locale
⏱ 2h

### 📌 2025-09-19 – PL-6g – i18n sync & defaults
- Script di sync; fallback EN; fix BOM/virgole; warning su en.json
⏱ 30m

### 📌 2025-09-20 – PL-6h – Gitignore integration
- Modulo check `.gitignore` + patch auto-fix in `preflight`
⏱ 2h 15m

### 📌 2025-09-20 – PL-6i – Automazione worklog: normalizzazione & totale
- aggiunti script autolog
- normalizza sezioni con ⏱ in coda
- ricalcolo Totale robusto
⏱ 2h 20m

### 📌 2025-09-20 – PL-6k – Tools cleanup & archive
- archiviati fix_* e patch_*;creato _archive datato
⏱ 10m

### 📌 2025-09-20 – PL-6l – Wrapper unico fasi 1+5+6
- creato ica-phase-all.ps1
- integra preflight+verifiche+commit
- parametri umani interattivi

### Totale
⏱ 23h 50m

### 📌 2025-09-20 – PL-6m – Evergreen: Chi siamo (IT/EN)
- pagine it/en
- SEO+breadcrumbs
- link header+footer
⏱ 2h

### 📌 2025-09-20 – PL-7 – Blog: categorie + pagina singolo pronta
- badge categoria
- pagina categoria
- SEO base
⏱ 45m

### 📌 2025-09-21 – PL-6z – Diagnostica DB & decisione cambio istanza
- Verifiche connessione Supabase (session/transaction pooler, direct)
- Test DNS/porte, variabili d’ambiente, encoding password
- Valutazione piani A/B (nuovo progetto Supabase vs Neon+Prisma)
- Decisione: procedere con nuovo progetto Supabase (piano A)

⏱ 6h

### 📌 2025-09-25 | PL-? | Local cover assets + blog pages refactor
- tools per gestione asset
- refactor pagine blog in Next.js
- pulizia rotte legacy
- test e verifica build
⏱ 3h

### 📌 2025-09-26 | PL-? | Cleanup repo + i18n header/footer + sanitizer
- rimozione rotte legacy; pulizia backup/cache/log (*.bak, .next/.turbo, log)
- i18n: SiteHeader/SiteFooter localizzati (EN/IT), link corretti
- sicurezza: sanitizer SSR-safe (isomorphic-dompurify)
- sitemap/robots rigenerati; build e smoke test OK
⏱ 4h 15m

### 📌 2025-09-27 | PL-1 | Debugging next-intl e reset configurazione
- Analisi errore runtime "Couldn't find next-intl config file"
- Ispezione e correzione file di configurazione (i18n.ts, middleware.ts, layout.tsx)
- Correzione dipendenza: downgrade da versione beta (4.x) a stabile (3.x) di next-intl
- Pulizia completa dipendenze (rimozione node_modules, package-lock.json) e reinstallazione
- Rimozione file/cartelle in conflitto (i18n/, .bak, script temporanei)
- Diagnostica avanzata con log per verificare il runtime del server
- Strategia finale: creazione nuovo progetto pulito per validare il setup
 ⏱ 4h 40m

 ### 📌 2025-09-27 | PL-2 | Cleanup progetto e finalizzazione configurazione i18n
- Analisi file e rimozione ambiguità (file .bak, config duplicate)
- Unificazione di `next.config.js` e `next.config.mjs`
- Pulizia finale cartelle non necessarie (i18n/, lib/)
- Riavvio server e validazione della soluzione finale
⏱ 1h 0m

### 📌 2025-09-27 | PL-3 | Reset e creazione progetto pulito per validazione i18n
- Creazione nuovo progetto Next.js (`next-intl-test`) con versioni stabili.
- Installazione e configurazione di `next-intl` su base pulita.
- Creazione file di configurazione (`i18n.ts`, `middleware.ts`).
- Ristrutturazione cartella `app` e creazione file di traduzione.
- Validazione finale del corretto funzionamento e identificazione del problema ambientale.
⏱1h 18m

 ### 📌 2025-09-27 | PL-4 | Migrazione su progetto pulito e test finale
- Eseguito script di migrazione per copiare componenti, asset e dipendenze.
- Unificata e pulita la configurazione di `next.config.mjs`.
- Eseguita reinstallazione pulita delle dipendenze con `npm install`.
- Avviato il server e validato il corretto funzionamento dell'internazionalizzazione.
⏱ 30m

 ### 📌 2025-09-27 | PL-5 | Connessione a Supabase e Test di Esecuzione
- Aggiunte variabili d'ambiente per Supabase (`.env.local`).
- Installate le librerie client di Supabase (`@supabase/ssr`).
- Creati i file helper per la connessione (`lib/supabase/client.ts` e `server.ts`).
- Eseguita query di test per leggere i dati dal database.
- Verificato il corretto funzionamento della connessione e del caricamento dati.
⏱ 45m

### 📌 2025-09-28 | PL-6 | Finalizzazione Setup i18n
- Spostamento e aggiornamento file di layout e pagina in `app/[locale]`.
- Creazione file di traduzione (`messages/it.json`, `en.json`).
- Esecuzione script `finalize_setup.py` per automatizzare e verificare la struttura.
- Test finale e validazione del corretto funzionamento delle traduzioni.
⏱ 1h 15m