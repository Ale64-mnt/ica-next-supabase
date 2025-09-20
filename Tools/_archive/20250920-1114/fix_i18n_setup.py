# Tools/fix_i18n_setup.py
# Allinea configurazione i18n (next-intl v3) e crea messaggi minimi.
# Esecuzione: .\.venv\Scripts\python.exe Tools\fix_i18n_setup.py

from pathlib import Path
from datetime import datetime
import json

ROOT = Path(__file__).resolve().parents[1]          # cartella che contiene webapp/
WEB = ROOT / "webapp"
assert WEB.exists(), f"Cartella non trovata: {WEB}"

def backup(p: Path):
    if p.exists():
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        p.rename(p.with_suffix(p.suffix + f".bak-{ts}"))

def write(p: Path, content: str, create_dir=True):
    if create_dir:
        p.parent.mkdir(parents=True, exist_ok=True)
    backup(p)
    p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")

# --- next.config.mjs ---
next_config = """\
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./next-intl.config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextIntl(nextConfig);
"""
write(WEB / "next.config.mjs", next_config)

# --- next-intl.config.ts ---
next_intl_cfg = """\
export default {
  locales: ['it', 'en', 'fr', 'es', 'de'],
  defaultLocale: 'it',
  localePrefix: 'always'
};
"""
write(WEB / "next-intl.config.ts", next_intl_cfg)

# --- i18n/routing.ts ---
routing_ts = """\
export const locales = ['it', 'en', 'fr', 'es', 'de'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'it';
export const localePrefix = 'always';
"""
write(WEB / "i18n" / "routing.ts", routing_ts)

# --- i18n/request.ts (getRequestConfig) ---
request_ts = """\
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}));
"""
write(WEB / "i18n" / "request.ts", request_ts)

# --- middleware.ts ---
middleware_ts = """\
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/routing';

export default createMiddleware({locales, defaultLocale});

export const config = {
  matcher: ['/((?!_next|.*\\\\..*).*)']
};
"""
write(WEB / "middleware.ts", middleware_ts)

# --- tsconfig.json: assicura alias "@/..." ---
tsconfig_path = WEB / "tsconfig.json"
base_tsconfig = {
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": True,
    "skipLibCheck": True,
    "strict": True,
    "noEmit": True,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": True,
    "isolatedModules": True,
    "jsx": "preserve",
    "incremental": True,
    "plugins": [],
    "baseUrl": ".",
    "paths": {"@/*": ["*"]}
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

if tsconfig_path.exists():
    try:
        data = json.loads(tsconfig_path.read_text(encoding="utf-8"))
    except Exception:
        data = base_tsconfig
    co = data.setdefault("compilerOptions", {})
    co.setdefault("baseUrl", ".")
    paths = co.setdefault("paths", {})
    paths.setdefault("@/*", ["*"])
    write(tsconfig_path, json.dumps(data, indent=2, ensure_ascii=False) + "\n", create_dir=False)
else:
    write(tsconfig_path, json.dumps(base_tsconfig, indent=2, ensure_ascii=False) + "\n")

# --- messages/*.json (UTF-8 no BOM) ---
messages = {
    "it": {
        "home": {"title": "Benvenuto", "intro": "Sito Next.js + i18n"},
        "nav": {"home": "Home", "about": "Chi siamo", "contact": "Contatti"}
    },
    "en": {
        "home": {"title": "Welcome", "intro": "Next.js + i18n site"},
        "nav": {"home": "Home", "about": "About", "contact": "Contact"}
    },
    "fr": {
        "home": {"title": "Bienvenue", "intro": "Site Next.js + i18n"},
        "nav": {"home": "Accueil", "about": "À propos", "contact": "Contact"}
    },
    "es": {
        "home": {"title": "Bienvenido", "intro": "Sitio Next.js + i18n"},
        "nav": {"home": "Inicio", "about": "Quiénes somos", "contact": "Contacto"}
    },
    "de": {
        "home": {"title": "Willkommen", "intro": "Next.js + i18n Seite"},
        "nav": {"home": "Start", "about": "Über uns", "contact": "Kontakt"}
    }
}
for loc, obj in messages.items():
    write(WEB / "messages" / f"{loc}.json", json.dumps(obj, ensure_ascii=False, indent=2) + "\n")

# --- Patch layout: usa getMessages da next-intl/server ---
layout_path = WEB / "app" / "[locale]" / "layout.tsx"
if layout_path.exists():
    layout = layout_path.read_text(encoding="utf-8")
    # sostituisci import e uso di getMessages
    layout = layout.replace(
        "from '@/i18n/request'",
        "from 'next-intl/server'"
    )
    layout = layout.replace(
        "NextIntlClientProvider messages={messages}",
        "NextIntlClientProvider locale={locale} messages={messages}"
    )
    # se manca import NextIntlClientProvider lo lasciamo inalterato
    # assicura chiamata senza argomenti (usa RequestConfig)
    layout = layout.replace("await getMessages(locale)", "await getMessages()")
    layout = layout.replace("await getMessages()", "await getMessages()")
    write(layout_path, layout, create_dir=False)

print("=== i18n setup: COMPLETATO ===")
print(f"- Root: {ROOT}")
print(f"- Scritti/aggiornati: next.config.mjs, next-intl.config.ts, i18n/*, middleware.ts, tsconfig.json, messages/*.json")
if layout_path.exists():
    print(f"- Patch layout: {layout_path}")
else:
    print("- ATTENZIONE: layout.tsx non trovato; crealo in app/[locale]/layout.tsx se serve.")
