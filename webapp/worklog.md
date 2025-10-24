###  2025-10-24 | RF-19 | Integrazione News System e Alert Management

- **Setup struttura Supabase in App Router** - Spostamento client Supabase in `app/lib/supabase/`
- **Implementazione news queries** - Sistema di query per tabella alert con TypeScript
- **Sviluppo componente NewsCard** - Componente React per display news in homepage
- **Integrazione homepage con dati reali** - Sostituzione dati statici con alert dal database
- **Risoluzione configurazione environment variables** - Fix caricamento variabili d'ambiente in server components
- **Cleanup struttura duplicata** - Rimozione file obsoleti da `lib/supabase/`

**Risultati:**
- Homepage news integration: **OPERATIVA**
- Alert system: **FUNZIONANTE** con dati reali
- Environment configuration: **RISOLTA**
- Code structure: **OTTIMIZZATA** per App Router

**File/modifiche principali:**
- `app/lib/supabase/` - Nuova struttura client Supabase
- `app/lib/supabase/news-queries.ts` - Query sistema news
- `app/components/NewsCard.tsx` - Componente card news
- `app/[locale]/page.tsx` - Homepage aggiornata con dati reali
- Rimozione `lib/supabase/` - Cleanup duplicati

 3h
