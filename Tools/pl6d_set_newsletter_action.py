# -*- coding: utf-8 -*-
"""
pl6d_set_newsletter_action.py
Imposta/aggiorna l'attributo action del form newsletter in:
- webapp/app/it/newsletter/page.tsx
- webapp/app/en/newsletter/page.tsx

Uso:
  python Tools/pl6d_set_newsletter_action.py "https://...sibforms.com/serve/...."

Idempotente: sostituisce qualsiasi action esistente (o placeholder) con l'URL passato.
Exit codes: 0=OK (almeno un file aggiornato o già corretto), 1=usage error, 2=I/O error
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
FILES = [
    WEBAPP / "app" / "it" / "newsletter" / "page.tsx",
    WEBAPP / "app" / "en" / "newsletter" / "page.tsx",
]

def set_action(path: Path, url: str) -> str:
    if not path.exists():
        return f"MISS  {path.relative_to(ROOT)}"
    try:
        src = path.read_text(encoding="utf-8")
    except Exception as e:
        return f"ERR   read {path.relative_to(ROOT)}: {e}"

    # sostituisci action="..."; supporta anche action='...'
    pat_dq = re.compile(r'action\s*=\s*"[^"]*"')
    pat_sq = re.compile(r"action\s*=\s*'[^']*'")

    new = src
    if pat_dq.search(new):
        new = pat_dq.sub(f'action="{url}"', new, count=1)
        tag = 'dq'
    elif pat_sq.search(new):
        new = pat_sq.sub(f'action="{url}"', new, count=1)
        tag = 'sq->dq'
    else:
        # se non trova l'attributo, prova ad inserirlo nel primo <form ...>
        new = re.sub(r"<form\s", f'<form action="{url}" ', new, count=1)
        tag = 'ins'

    if new != src:
        try:
            path.write_text(new, encoding="utf-8")
        except Exception as e:
            return f"ERR   write {path.relative_to(ROOT)}: {e}"
        return f"PATCH {path.relative_to(ROOT)} ({tag})"

    return f"OK    {path.relative_to(ROOT)} (già impostato)"

def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python Tools/pl6d_set_newsletter_action.py \"https://...sibforms.com/serve/...\"")
        return 1

    url = sys.argv[1].strip()
    changes = [set_action(p, url) for p in FILES]

    print("=== pl6d_set_newsletter_action ===")
    for line in changes:
        print(line)

    # ritorna 0 anche se i file erano già corretti
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
