# -*- coding: utf-8 -*-
"""
fix_layout_locales_const.py
Patcher idempotente per app/[locale]/layout.tsx:
- garantisce la presenza di `const LOCALES = ['it','en'] as const;`
  dopo il blocco import e prima di generateMetadata.
- non duplica se già presente.
Exit: 0 OK, 2 errori I/O.
"""
from __future__ import annotations
from pathlib import Path
import re
import sys

ROOT = Path(".").resolve()
LAYOUT = ROOT / "webapp" / "app" / "[locale]" / "layout.tsx"

INSERT_LINE = "const LOCALES = ['it','en'] as const;"

def patch_layout(p: Path) -> str:
    if not p.exists():
        return f"[ERROR] File non trovato: {p}"
    src = p.read_text(encoding="utf-8")

    if "const LOCALES" in src:
        return "[OK] LOCALES già presente, nessuna modifica"

    # Trova fine del blocco import (ultima riga che inizia con 'import ')
    lines = src.splitlines()
    last_import_idx = -1
    for i, ln in enumerate(lines):
        if ln.strip().startswith("import "):
            last_import_idx = i

    if last_import_idx == -1:
        # fallback: inserisci all'inizio
        new_lines = [INSERT_LINE, ""] + lines
    else:
        # inserisci dopo l'ultimo import, lasciando una riga vuota
        new_lines = lines[: last_import_idx + 1] + ["", INSERT_LINE, ""] + lines[last_import_idx + 1 :]

    new_src = "\n".join(new_lines) + ("\n" if not src.endswith("\n") else "")
    p.write_text(new_src, encoding="utf-8")
    return "[PATCH] Aggiunta const LOCALES in layout.tsx"

def main() -> int:
    msg = patch_layout(LAYOUT)
    print(msg)
    return 0 if msg.startswith(("[OK]", "[PATCH]")) else 2

if __name__ == "__main__":
    raise SystemExit(main())
