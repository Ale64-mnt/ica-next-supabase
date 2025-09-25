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


2025-09-25 | 3h | Local cover assets + blog pages refactor
Tasks: tools + pagine Next.js + pulizia rotte legacy + test
