# -*- coding: utf-8 -*-
"""
Fix Tailwind config to enable @tailwindcss/typography
Alessandro – PL-3 integrazione tipografia
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
TAILWIND_CONFIG = WEBAPP / "tailwind.config.ts"
GLOBALS_CSS = WEBAPP / "app/globals.css"

PLUGIN_IMPORT = 'import typography from "@tailwindcss/typography";'
PLUGIN_USE = "typography"

def ensure_typography_plugin():
    if not TAILWIND_CONFIG.exists():
        print(f"[ERR] File non trovato: {TAILWIND_CONFIG}")
        return

    text = TAILWIND_CONFIG.read_text(encoding="utf-8")

    # aggiungi import se manca
    if PLUGIN_IMPORT not in text:
        text = PLUGIN_IMPORT + "\n" + text
        print("[UP] aggiunto import in tailwind.config.ts")

    # aggiungi plugins se manca
    if "plugins:" in text:
        if PLUGIN_USE not in text:
            text = text.replace("plugins: [", f"plugins: [{PLUGIN_USE}, ")
            print("[UP] aggiunto plugin typography in tailwind.config.ts")
    else:
        # se non esiste plugins, appendiamo
        text = text.replace("};", f"  plugins: [{PLUGIN_USE}],\n}};")
        print("[UP] creato plugins con typography")

    TAILWIND_CONFIG.write_text(text, encoding="utf-8")

def ensure_globals_css():
    if not GLOBALS_CSS.exists():
        print(f"[ERR] File non trovato: {GLOBALS_CSS}")
        return

    text = GLOBALS_CSS.read_text(encoding="utf-8")

    if ".prose a" not in text:
        text += """

/* Tipografia personalizzata */
.prose a {
  @apply text-blue-600 underline hover:text-blue-800;
}
"""
        GLOBALS_CSS.write_text(text, encoding="utf-8")
        print("[UP] aggiunta sezione tipografia in globals.css")
    else:
        print("[OK] tipografia già presente in globals.css")

def main():
    ensure_typography_plugin()
    ensure_globals_css()
    print("[DONE] Tailwind typography fix completato.")

if __name__ == "__main__":
    main()
