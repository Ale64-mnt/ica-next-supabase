# Tools/ensure_next_intl_config.py
from pathlib import Path

WEBAPP = Path(__file__).resolve().parents[1] / "webapp"
CFG = WEBAPP / "next-intl.config.ts"

CONTENT = """\
import {defineConfig} from 'next-intl';

export default defineConfig({
  locales: ['it', 'en', 'fr', 'es', 'de'],
  defaultLocale: 'it',
  localePrefix: 'always'
});
"""

WEBAPP.mkdir(parents=True, exist_ok=True)
CFG.write_text(CONTENT, encoding="utf-8")
print(f"✅ creato/aggiornato {CFG}")
