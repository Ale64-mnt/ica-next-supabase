## 2025-09-25 — Fase: copertine locali per blog (3h)
- Script Tools/setup_local_covers.py per normalizzare cover_url su asset locali
- Placeholder locale /public/covers/placeholder.svg
- Aggiornate pagine blog (lista/dettaglio/categoria) a usare solo next/image con asset locali
- Rimozione rotte legacy non localizzate /app/blog
- Verifica end-to-end /it/blog e categorie
Esito: ✅ ok in dev

### 📌 2025-10-05 | PL-20 | Implementazione Piattaforma EFAMA-Compliant

## Conformità Linee Guida EFAMA:

### Struttura Contenuti Educativi
- Risorse educative finanziarie multilingue (IT, EN, DE, ES, FR)
- Gerarchia informativa chiara con navigazione accessibile
- Sezioni aggiornamenti normativi UE e notizie finanziarie nazionali

### Standard Tecnici
- Navigazione conforme WCAG 2.1 AA e rapporti di contrasto
- Design responsive per tutti i tipi di dispositivo
- Struttura HTML semantica per screen reader
- Link skip-to-content per navigazione da tastiera

### Accessibilità Europea
- Supporto 5 lingue ufficiali UE
- Adattamento culturale contenuti finanziari
- Risorse educative transfrontaliere
- Dichiarazione trasparenza finanziamento UE

### Framework Educazione Finanziaria
- Percorsi educativi a tre livelli:
  - Scuole: Moduli alfabetizzazione finanziaria
  - Cittadini: Guide interattive e quiz
  - Adulti/Senior: Gestione risparmi e prevenzione frodi
- Integrazione principi finanza etica
- Contenuti indipendenti e trasparenti

**File chiave:**
- `components/navigation/Header.tsx` (sistema navigazione centralizzato)
- `messages/*.json` (infrastruttura i18n 5 lingue)
- `app/[locale]/page.tsx` (homepage standard UE)
- `app/[locale]/layout.tsx` (framework accessibilità)

**Riferimenti:**
- EFAMA Financial Education Guidelines 2024
- EU Digital Finance Strategy 2023
- WCAG 2.1 AA Compliance
- EU Web Accessibility Directive

⏱ 40m
