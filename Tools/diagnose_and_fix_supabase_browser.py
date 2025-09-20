# -*- coding: utf-8 -*-
"""
diagnose_and_fix_supabase_browser.py
Diagnosi + fix per supabaseBrowser non definito.
- Crea lib/supabaseBrowser.ts se manca
- Patcha NewsList.tsx (import, call supabaseBrowser(), 'use client')
Idempotente.
"""
from __future__ import annotations
import re
from pathlib import Path
import sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
LIB_FILE = WEBAPP / "lib" / "supabaseBrowser.ts"

LIB_CONTENT = """'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
"""

IMPORT_LINE = "import { supabaseBrowser } from '@/lib/supabaseBrowser';"
USE_CLIENT = "'use client';"

def ensure_lib() -> list[str]:
    logs = []
    if not LIB_FILE.exists():
        LIB_FILE.parent.mkdir(parents=True, exist_ok=True)
        LIB_FILE.write_text(LIB_CONTENT, encoding="utf-8")
        logs.append(f"CREATE {LIB_FILE.relative_to(ROOT)}")
    else:
        logs.append(f"EXIST  {LIB_FILE.relative_to(ROOT)}")
    return logs

def add_use_client(text: str) -> tuple[str, bool]:
    lines = text.splitlines()
    if any(l.strip().strip('"').strip("'") == "use client" for l in lines[:3]):
        return text, False
    new_text = USE_CLIENT + "\n" + text
    return new_text, True

def ensure_import(text: str) -> tuple[str, bool]:
    if IMPORT_LINE in text:
        return text, False
    lines = text.splitlines()
    out = []
    inserted = False
    if lines and lines[0].strip().strip('"').strip("'") == "use client":
        out.append(lines[0])
        out.append(IMPORT_LINE)
        out.extend(lines[1:])
        inserted = True
    if not inserted:
        out.append(IMPORT_LINE)
        out.extend(lines)
    return "\n".join(out), True

def fix_calls(text: str) -> tuple[str, int]:
    pattern = r"\bsupabaseBrowser\b(?!\s*\()"
    new_text, n = re.subn(pattern, "supabaseBrowser()", text)
    return new_text, n

def process_tsx_file(p: Path) -> list[str]:
    logs = []
    try:
        txt = p.read_text(encoding="utf-8")
    except Exception as e:
        return [f"ERR   {p.relative_to(ROOT)}: {e}"]

    touched = False
    if "supabaseBrowser" in txt or "useEffect(" in txt:
        if "useEffect(" in txt and "use client" not in txt:
            txt, added = add_use_client(txt)
            if added:
                logs.append(f"ADD   use client -> {p.relative_to(ROOT)}")
                touched = True
        if "supabaseBrowser" in txt and IMPORT_LINE not in txt:
            txt, _ = ensure_import(txt)
            logs.append(f"ADD   import supabaseBrowser -> {p.relative_to(ROOT)}")
            touched = True
        txt2, n = fix_calls(txt)
        if n > 0:
            logs.append(f"PATCH {p.relative_to(ROOT)} supabaseBrowser() x{n}")
            txt = txt2
            touched = True

    if touched:
        try:
            p.write_text(txt, encoding="utf-8")
        except Exception as e:
            return [f"ERR   write {p.relative_to(ROOT)}: {e}"]
    else:
        if "supabaseBrowser" in txt:
            logs.append(f"OK    {p.relative_to(ROOT)} (già corretto)")
    return logs

def main() -> int:
    overall = []
    changed = False

    overall.extend(ensure_lib())

    for p in WEBAPP.rglob("*.tsx"):
        overall.extend(process_tsx_file(p))
    for p in WEBAPP.rglob("*.ts"):
        if p.name.endswith(".d.ts") or "lib" in p.parts:
            continue
        overall.extend(process_tsx_file(p))

    print("=== diagnose_and_fix_supabase_browser ===")
    for line in overall:
        print(line)
        if line.startswith(("CREATE","ADD","PATCH")):
            changed = True

    print(f"\n[END] Status: {'WARNING (patched)' if changed else 'OK'}")
    return 1 if changed else 0

if __name__ == "__main__":
    sys.exit(main())
