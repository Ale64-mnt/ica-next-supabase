# Tools/patch_next_config_intl.py
from pathlib import Path
import re

WEBAPP = Path(__file__).resolve().parents[1] / "webapp"
CFG = WEBAPP / "next.config.mjs"

if not CFG.exists():
    CFG.write_text("", encoding="utf-8")

src = CFG.read_text(encoding="utf-8")

# Se già presente, non fare nulla
if "next-intl/plugin" in src or "withNextIntl" in src:
    print("✅ next.config.mjs: plugin next-intl già configurato.")
else:
    # Inserisce il plugin in testa e wrappa l'export di default
    # Caso 1: export default <qualcosa>
    m = re.search(r"export\s+default\s+([^\n;]+)", src)
    if m:
        exported = m.group(1).strip()
        patched = (
            "import createNextIntlPlugin from 'next-intl/plugin';\n"
            "const withNextIntl = createNextIntlPlugin();\n\n"
        )
        patched += re.sub(
            r"export\s+default\s+([^\n;]+)",
            f"export default withNextIntl({exported})",
            src,
            count=1,
        )
        CFG.write_text(patched, encoding="utf-8")
        print("✅ next.config.mjs patchato (wrappato export esistente con withNextIntl).")
    else:
        # Caso 2: file vuoto o senza export: creiamo una config minimale
        patched = (
            "import createNextIntlPlugin from 'next-intl/plugin';\n"
            "const withNextIntl = createNextIntlPlugin();\n\n"
            "export default withNextIntl({});\n"
        )
        CFG.write_text(patched, encoding="utf-8")
        print("✅ next.config.mjs creato con plugin next-intl.")
