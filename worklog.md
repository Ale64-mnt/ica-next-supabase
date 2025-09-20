# Worklog – ICA Next.js + Supabase

### 📌 2025-09-10 – Bootstrap – Primo log di prova
- Inizializzazione repo e ambiente
⏱ 0h 10m

### 📌 2025-09-10 – Fix i18n – next-intl v4, middleware, routing, request.ts
- Configurazione i18n base e middlewares
⏱ 0h 40m

### 📌 2025-09-11 – Fase 2 – layout.tsx, messaggi base, test /it /en
- Implementazione layout e messaggi; smoke test lingue
⏱ 1h 15m

### 📌 2025-09-11 – Commit fase 3 – salvataggio componenti e messaggi
- Git snapshot (Navbar, LanguageSwitcher, pagine, messaggi)
⏱ 0h 5m

### 📌 2025-09-12 – Fase 4 – Integrazione Supabase
- News & articles online (lettura pubblica)
⏱ 0h 20m

### 📌 2025-09-12 – Admin News – create news con service_role
- Route server-side sicura; form creazione news
⏱ 1h 0m

### 📌 2025-09-14 – Admin Blog – sezione traduzioni
- Creata sezione Admin Blog con gestione traduzioni
⏱ 2h 5m

### 📌 2025-09-14 – Admin Blog base – upload cover, slug unico, lista post
- Form editoriale; policy DEV temporanea
⏱ 2h 45m

### 📌 2025-09-14 – Fix variabili ambiente + /api/debug-env
- Corretto .env.local, route di diagnostica
⏱ 0h 15m

### 📌 2025-09-14 – Admin Blog hardening – RLS
- Rimosse policy anon CRUD; rimane SELECT pubblica
⏱ 0h 20m

### 📌 2025-09-15 – Blog multilingua – JSON i18n aggiornati
- it/en/es/fr/de; rimossi BOM
⏱ 0h 15m

### 📌 2025-09-15 – PL-2 News pubblico – dettaglio /news/[slug]
- Fix i18n; seed SQL
⏱ 0h 50m

### 📌 2025-09-17 – PL-4 News/Blog – formattazione editoriale
- Titolo, badge categoria, cover, summary, body Markdown; fix slug duplicati; debug rendering
⏱ 1h 55m

### 📌 2025-09-17 – PL-5b – Integrazione SiteHeader/SiteFooter
- Inseriti nel layout principale
⏱ 0h 40m

### 📌 2025-09-18 – PL-5b – Pulizia EditorialLayout + home + logo
- Test `pl5b_verify` ✅
⏱ 3h 0m

### 📌 2025-09-19 – PL-6f – Fix NewsList
- Rewrite completo + `supabaseBrowser.ts`
⏱ 1h 0m

### 📌 2025-09-19 – PL-6e – Evergreen “AI Ethics” (it/en)
- Metadata avanzati (title/description/OG, hreflang, breadcrumbs); test locale
⏱ 2h 0m

### 📌 2025-09-19 – PL-6g – i18n sync & defaults
- Script di sync; fallback EN; fix BOM/virgole; warning su en.json
⏱ 0h 30m

### 📌 2025-09-20 – PL-6h – Gitignore integration
- Modulo check `.gitignore` + patch auto-fix in `preflight`
⏱ 2h 15m

### 📌 2025-09-20 – PL-6i – Automazione worklog: normalizzazione & totale
- aggiunti script autolog
- normalizza sezioni con ⏱ in coda
- ricalcolo Totale robusto
⏱ 25h 20m

### 📌 2025-09-20 – PL-6k – Tools cleanup & archive
- archiviati fix_* e patch_*;creato _archive datato
⏱ 0h 10m

🔹 Totale

⏱ 46h 50m
