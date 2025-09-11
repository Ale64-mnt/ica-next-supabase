# Esecuzione: .\.venv\Scripts\python.exe Tools\patch_set_request_locale.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAYOUT = ROOT / "webapp" / "app" / "[locale]" / "layout.tsx"

text = LAYOUT.read_text(encoding="utf-8")

# 1) importa setRequestLocale se manca
if "unstable_setRequestLocale" not in text:
    text = text.replace(
        "import {locales} from '@/i18n/routing';",
        "import {locales} from '@/i18n/routing';\nimport {unstable_setRequestLocale as setRequestLocale} from 'next-intl/server';"
    )

# 2) chiama setRequestLocale(locale) subito dentro RootLayout
marker = "}) {"
if marker in text and "setRequestLocale(locale)" not in text:
    text = text.replace(marker, marker + "\n  setRequestLocale(locale);")

LAYOUT.write_text(text, encoding="utf-8")
print("[OK] setRequestLocale(locale) applicato in:", LAYOUT)
