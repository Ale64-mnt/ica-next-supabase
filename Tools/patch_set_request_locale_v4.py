from pathlib import Path

p = Path("webapp/app/[locale]/layout.tsx")
t = p.read_text(encoding="utf-8")

# importa setRequestLocale corretto per next-intl v4
t = t.replace(
    "import {unstable_setRequestLocale as setRequestLocale} from 'next-intl/server';",
    "import {setRequestLocale} from 'next-intl/server';"
)

if "import {setRequestLocale} from 'next-intl/server';" not in t:
    t = t.replace(
        "import {locales} from '@/i18n/routing';",
        "import {locales} from '@/i18n/routing';\nimport {setRequestLocale} from 'next-intl/server';"
    )

# aggiungi la chiamata se manca
if "setRequestLocale(locale)" not in t:
    t = t.replace("}) {", "}) {\n  setRequestLocale(locale);")

p.write_text(t, encoding="utf-8")
print("[OK] Patched layout.tsx for next-intl v4 setRequestLocale")