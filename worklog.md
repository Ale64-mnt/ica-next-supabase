📑 Worklog – ICA Next.js + Supabase
🔹 Bootstrap e Setup
Data	Attività	Tempo
2025-09-10	Primo log di prova	10m
2025-09-10	Fix i18n: configurazione next-intl v4, middleware, routing, request.ts	40m
🔹 Fase 2 – i18n completata
Data	Attività	Tempo
2025-09-11	Completata Fase 2: layout.tsx, messaggi base, test /it /en	1h 15m
2025-09-11	Commit fase 3: salvataggio Git (Navbar, LanguageSwitcher, pagine, messaggi)	5m
🔹 Fase 4 – Integrazione Supabase
Data	Attività	Tempo
2025-09-12	Commit fase 4: Integrazione Supabase, news e articles online	20m
🔹 Fase 5 – Admin News \& Blog
Data	Attività	Tempo
2025-09-12	Admin News: form create news, route server-side con service\_role	1h
2025-09-14	Admin Blog: creata sezione con gestione traduzioni	2h 5m
2025-09-14	Admin Blog base: form con upload cover, slug unico, lista post, policy DEV	2h 45m
2025-09-14	Fix variabili ambiente + debug-env	15m
2025-09-14	Admin Blog hardening: rimosse policy anon CRUD, rimasta sola SELECT pubblica	20m
🔹 Fase 6 – Multilingua, Formattazione e SEO
Data	Attività	Tempo
2025-09-15	Blog multilingua: aggiornati JSON i18n (it/en/es/fr/de), rimossi BOM	15m
2025-09-15	PL-2 News pubblico: creata pagina dettaglio news \[slug], fix i18n, seed SQL	50m
2025-09-17	PL-4 News/Blog: formattazione editoriale (titolo, badge, cover, summary, markdown); fix slug duplicati; debug rendering articoli	1h 55m
2025-09-17	PL-5b: Integrazione SiteHeader/SiteFooter in layout.tsx	40m
2025-09-18	PL-5b: Pulizia EditorialLayout, home aggiornata, logo collegato, test pl5b\_verify ✅	3h
2025-09-19	PL-6f: Fix NewsList – rewrite completo con supabaseBrowser.ts	1h
2025-09-19	PL-6e: Pagine evergreen SEO AI Ethics (it/en), metadata avanzati, test locale	2h

\### 📌 2025-09-19 – PL-6g – i18n sync \& defaults

\- Creato script `Tools/i18n\_sync\_from\_en.py` per:

&nbsp; - Allineare chiavi mancanti in tutti i file i18n

&nbsp; - Inserire valori di default (`home.empty` in EN/IT, fallback EN per altre lingue)

&nbsp; - Rimuovere BOM e fix virgole

&nbsp; - Warning se `en.json` contiene stringhe in italiano  

⏱ 30m

### 📌 2025-09-20 – PL-6h – Gitignore integration
- Creato script `Tools/pl6h_gitignore_integration.py` per:
  - generare `pl_gitignore_check.py` con regole standard
  - integrare il controllo `.gitignore` in `preflight.py` con auto-fix
- Testato con `preflight.py`: output `[OK]/[PATCH]/[WARN]` automatico
⏱ 15m

🔹 Totale

⏱ 45m
