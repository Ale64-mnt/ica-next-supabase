# -*- coding: utf-8 -*-
"""
fix_newslist_import.py
Corregge import errati in components/NewsList.tsx:
- rimuove le () dal nome
- normalizza il path a '@/lib/supabaseBrowser'
Idempotente.
"""
from __future__ import annotations
from pathlib import Path
import sys, re

ROOT = Path(".").resolve()
NEWSLIST = ROOT / "webapp" / "components" / "NewsList.tsx"

GOOD_IMPORT = "import { supabaseBrowser } from '@/lib/supabaseBrowser';"

def main() -> int:
    if not NEWSLIST.exists():
        print(f"[MISS] {NEWSLIST}")
        return 1

    txt = NEWSLIST.read_text(encoding="utf-8")

    # elimina qualsiasi import con supabaseBrowser sbagliato
    lines = []
    for line in txt.splitlines():
        if "supabaseBrowser" in line and "import" in line:
            continue
        lines.append(line)

    # aggiungi in testa l'import corretto, subito dopo 'use client'
    if lines and lines[0].strip().strip("'\"") == "use client":
        new_txt = "\n".join([lines[0], GOOD_IMPORT] + lines[1:])
    else:
        new_txt = "\n".join([GOOD_IMPORT] + lines)

    if new_txt != txt:
        NEWSLIST.write_text(new_txt, encoding="utf-8")
        print(f"[FIXED] {NEWSLIST.relative_to(ROOT)}")
        return 1

    print("[OK] già corretto")
    return 0

if __name__ == "__main__":
    sys.exit(main())
