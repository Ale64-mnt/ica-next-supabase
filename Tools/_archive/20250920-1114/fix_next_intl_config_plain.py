from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "webapp"
cfg = ROOT / "next-intl.config.ts"

content = """\
// next-intl v4: niente defineConfig, si esporta un oggetto semplice
// Riconosciuto automaticamente dal plugin `next-intl/plugin` in next.config.mjs.
const config = {
  locales: ['it', 'en', 'fr', 'es', 'de'],
  defaultLocale: 'it',
  // 'always' -> l'URL include sempre la locale (/it, /en, ...)
  // puoi usare 'as-needed' se vuoi evitare la locale per la lingua di default
  localePrefix: 'always'
};

export default config;
"""

cfg.parent.mkdir(parents=True, exist_ok=True)
cfg.write_text(content, encoding="utf-8")
print(f"✅ Aggiornato {cfg}")
