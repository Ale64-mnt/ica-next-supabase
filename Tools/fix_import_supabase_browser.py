# -*- coding: utf-8 -*-
"""
fix_import_supabase_browser.py
Corregge import errati generati in precedenza:
- rimuove eventuali "()" da `import { supabaseBrowser() }`
- normalizza il path a '@/lib/supabaseBrowser'
"""

from __future__ import annotations
from pathlib import Path
import re, sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"

GOOD_IMPORT = "import { supabaseBrowser } from '@/lib/supabaseBrowser';"

def fix_file(p: Path) -> list[str]:
    logs = []
    try:
        txt = p.read_text(encoding="utf-8")
    except Exception as e:
        return [f"ERR {p}: {e}"]

    # trova import sbagliati
    bad_pattern = re.compile(r"import\s+\{[^}]*supabaseBrowser\(\)[^}]*\}\s+from\s+['\"][^'\"]+['\"];?")
    bad2_pattern = re.compile(r"import\s+\{[^}]*supabaseBrowser[^}]*\}\s+from\s+['\"]@/lib/supabaseBrowser\(\)['\"];?")
    if bad_pattern.search(txt) or bad2_pattern.search(txt):
        # rimuovi linee sbagliate
        new_lines = []
        for line in txt.splitlines():
            if "supabaseBrowser()" in line or "supabaseBrowser(" in line and "import" in line:
                continue
            if "@/lib/supabaseBrowser()" in line:
                continue
            new_lines.append(line)
        # aggiungi import corretto in testa (dopo eventuale 'use client')
        if new_lines and new_lines[0].strip().strip("'\"") == "use client":
            out = [new_lines[0], GOOD_IMPORT] + new_lines[1:]
        else:
            out = [GOOD_IMPORT] + new_lines
        txt2 = "\n".join(out)
        p.write_text(txt2, encoding="utf-8")
        logs.append(f"FIXED {p.relative_to(ROOT)}")
    return logs

def main():
    logs = []
    for p in WEBAPP.rglob("*.tsx"):
        logs.extend(fix_file(p))
    print("=== fix_import_supabase_browser ===")
    for l in logs:
        print(l)
    if not logs:
        print("No changes")
    return 0

if __name__ == "__main__":
    sys.exit(main())
