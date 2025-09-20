# -*- coding: utf-8 -*-
"""
final_fix_supabase_imports.py
Scopo: sanare TUTTI i file TS/TSX che usano `supabaseBrowser`.
- Corregge import errati (parentesi nella named import o nel path)
- Garantisce import corretto:  import { supabaseBrowser } from '@/lib/supabaseBrowser';
- Garantisce che le chiamate usino supabaseBrowser() (aggiunge le parentesi se mancanti)
- Se il file usa useEffect, assicura la direttiva 'use client' in testa
- Crea webapp/lib/supabaseBrowser.ts se manca

Idempotente: applica modifiche solo quando necessario.
Exit codes: 0=OK (nessuna modifica), 1=WARNING (patch applicate), 2=ERROR (I/O)
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
LIB_FILE = WEBAPP / "lib" / "supabaseBrowser.ts"

GOOD_IMPORT = "import { supabaseBrowser } from '@/lib/supabaseBrowser';"
USE_CLIENT = "'use client';"

LIB_CONTENT = (
    "'use client';\n\n"
    "import { createBrowserClient } from '@supabase/ssr';\n\n"
    "export const supabaseBrowser = () =>\n"
    "  createBrowserClient(\n"
    "    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n"
    "    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n"
    "  );\n"
)

# Patterns per import sbagliati
BAD_IMPORT_HAS_PARENS = re.compile(
    r"""^import\s+\{\s*[^}]*supabaseBrowser\(\)[^}]*\}\s+from\s+['"][^'"]+['"];?\s*$""",
    re.MULTILINE,
)
BAD_IMPORT_BAD_PATH = re.compile(
    r"""^import\s+\{[^}]*supabaseBrowser[^}]*\}\s+from\s+['"]@/lib/supabaseBrowser\(\)['"];?\s*$""",
    re.MULTILINE,
)

def ensure_lib() -> str:
    if LIB_FILE.exists():
        return "EXIST " + str(LIB_FILE)
    LIB_FILE.parent.mkdir(parents=True, exist_ok=True)
    LIB_FILE.write_text(LIB_CONTENT, encoding="utf-8")
    return "CREATE " + str(LIB_FILE)

def add_use_client(text: str) -> tuple[str, bool]:
    lines = text.splitlines()
    head = [ln.strip().strip('"').strip("'") for ln in lines[:3]]
    if "use client" in head:
        return text, False
    return USE_CLIENT + "\n" + text, True

def normalize_imports(text: str) -> tuple[str, int]:
    """Rimuove import errati e inserisce GOOD_IMPORT una volta sola in alto (dopo 'use client' se presente)."""
    changed = 0
    orig = text
    text = BAD_IMPORT_HAS_PARENS.sub("", text)
    text = BAD_IMPORT_BAD_PATH.sub("", text)
    if text != orig:
        changed += 1
    if GOOD_IMPORT not in text:
        lines = text.splitlines()
        if lines and lines[0].strip().strip('"').strip("'") == "use client":
            lines = [lines[0], GOOD_IMPORT] + lines[1:]
        else:
            lines = [GOOD_IMPORT] + lines
        text = "\n".join(lines)
        changed += 1
    return text, changed

def ensure_calls_have_parens(text: str) -> tuple[str, int]:
    pattern = re.compile(r"\bsupabaseBrowser\b(?!\s*\()")
    new_text, n = pattern.subn("supabaseBrowser()", text)
    return new_text, n

def process_file(p: Path) -> list[str]:
    logs = []
    try:
        txt = p.read_text(encoding="utf-8")
    except Exception as e:
        return [f"ERR read {p}: {e}"]

    touched = False

    if "useEffect(" in txt:
        txt2, added = add_use_client(txt)
        if added:
            logs.append(f"ADD use client -> {p}")
            txt = txt2
            touched = True

    if "supabaseBrowser" in txt:
        txt2, nimp = normalize_imports(txt)
        if nimp:
            logs.append(f"FIX import -> {p}")
            txt = txt2
            touched = True
        txt3, ncalls = ensure_calls_have_parens(txt)
        if ncalls:
            logs.append(f"FIX calls ({ncalls}) -> {p}")
            txt = txt3
            touched = True

    if touched:
        try:
            p.write_text(txt, encoding="utf-8")
        except Exception as e:
            return [f"ERR write {p}: {e}"]

    if touched:
        return ["PATCH " + str(p)]
    return []

def main() -> int:
    changes = []
    changes.append(ensure_lib())
    for ext in ("*.tsx", "*.ts"):
        for p in WEBAPP.rglob(ext):
            if p.name.endswith(".d.ts"):
                continue
            if "lib" in p.parts and p.name == "supabaseBrowser.ts":
                continue
            changes.extend(process_file(p))

    print("=== final_fix_supabase_imports ===")
    for line in changes:
        print(line)
    any_patch = any(line.startswith(("PATCH", "CREATE", "FIX", "ADD")) for line in changes)
    return 1 if any_patch else 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print("[ERROR]", e)
        sys.exit(2)
