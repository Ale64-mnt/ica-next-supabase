# -*- coding: utf-8 -*-
"""
fix_newslist_supabase.py
- Crea webapp/lib/supabaseBrowser.ts con client browser Supabase
- Parcha components/NewsList.tsx per usare supabaseBrowser()

Idempotente: non sovrascrive se già corretto.
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
LIB_FILE = WEBAPP / "lib" / "supabaseBrowser.ts"
NEWSLIST_FILE = WEBAPP / "components" / "NewsList.tsx"

LIB_CONTENT = r"""'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
"""

def ensure_lib(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path.relative_to(ROOT)}"

def patch_newslist(path: Path) -> list[str]:
    logs: list[str] = []
    if not path.exists():
        logs.append(f"MISS {path.relative_to(ROOT)}")
        return logs

    txt = path.read_text(encoding="utf-8")

    # Import supabaseBrowser
    if "supabaseBrowser" not in txt or "from '@/lib/supabaseBrowser'" not in txt:
        if "supabaseBrowser" in txt:
            # ha usato ma senza import
            txt = re.sub(r"(^import[^\n]+;)", r"\1\nimport { supabaseBrowser } from '@/lib/supabaseBrowser';", txt, 1, flags=re.M)
            logs.append("PATCH import supabaseBrowser")
        else:
            # nessuna occorrenza: solo aggiungi import
            txt = "import { supabaseBrowser } from '@/lib/supabaseBrowser';\n" + txt
            logs.append("ADD import supabaseBrowser")

    # Uso: supabaseBrowser -> supabaseBrowser()
    if re.search(r"\bsupabaseBrowser\b(?!\s*\()", txt):
        txt = re.sub(r"\bsupabaseBrowser\b(?!\s*\()", "supabaseBrowser()", txt)
        logs.append("PATCH call supabaseBrowser()")

    path.write_text(txt, encoding="utf-8")
    return logs or ["OK NewsList.tsx"]

def main() -> int:
    notes = []
    notes.append(ensure_lib(LIB_FILE, LIB_CONTENT))
    notes.extend(patch_newslist(NEWSLIST_FILE))

    print("=== fix_newslist_supabase ===")
    for n in notes:
        print(n)
    return 0

if __name__ == "__main__":
    sys.exit(main())
