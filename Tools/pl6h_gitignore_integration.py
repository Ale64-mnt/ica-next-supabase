# -*- coding: utf-8 -*-
"""
pl6h_gitignore_integration.py
- Crea/aggiorna Tools/pl_gitignore_check.py con il controllo standard .gitignore
- Integra il check in Tools/preflight.py aggiungendo:
  * import del modulo se mancante
  * un blocco __main__ che esegue ensure_gitignore(auto_fix=True) e stampa l'esito
Idempotente e conservativo (non riscrive preflight.py, lo patcha in modo mirato).
Exit: 0 OK, 2 errori I/O.
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(".").resolve()
TOOLS = ROOT / "Tools"
PRE = TOOLS / "preflight.py"
MOD = TOOLS / "pl_gitignore_check.py"

MOD_SRC = """# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GITIGNORE = ROOT / ".gitignore"

BLOCK = \"\"\"# === Node / Next.js ===
node_modules/
.next/
out/
dist/

# === Logs & cache ===
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
*.log
.cache/
*.tmp
*.temp

# === Python / venv ===
.venv/
__pycache__/
*.pyc
*.pyo
*.pyd
*.egg-info/
.eggs/

# === IDE / OS ===
.vscode/
.idea/
.DS_Store
Thumbs.db

# === Project-specific ===
.pl_timer.json
tree.txt
reports/
_trash/

*.bak
*.bak-*

# Build/test output
coverage/
.env.local
.env.*.local

# === Supabase generated ===
supabase/.temp
\"\"\"


def ensure_gitignore(auto_fix: bool = True) -> tuple[str, int]:
    \"\"\"Controlla/aggiorna .gitignore. Ritorna (status, added_count).
    status: 'OK' | 'PATCH' | 'MISSING'
    \"\"\"
    existing = []
    if GITIGNORE.exists():
        existing = GITIGNORE.read_text(encoding="utf-8").splitlines()

    new_lines = BLOCK.splitlines()
    merged = list(existing)

    added = 0
    for line in new_lines:
        if line.strip() and line not in existing:
            merged.append(line)
            added += 1

    if added and auto_fix:
        GITIGNORE.write_text("\\n".join(merged) + "\\n", encoding="utf-8")
        return ("PATCH", added)
    elif added:
        return ("MISSING", added)
    else:
        return ("OK", 0)
"""

APPEND_BLOCK = """
# --- auto-added by pl6h_gitignore_integration.py ---
if __name__ == "__main__":
    try:
        from pl_gitignore_check import ensure_gitignore
        status, added = ensure_gitignore(auto_fix=True)
        if status == "OK":
            print("[OK] .gitignore completo")
        elif status == "PATCH":
            print(f"[PATCH] .gitignore aggiornato (+{added})")
        else:
            print(f"[WARN] Mancano {added} regole in .gitignore (no auto-fix)")
    except Exception as e:
        print("[WARN] .gitignore check failed:", e)
# --- end auto-added ---
"""

def ensure_module() -> str:
    TOOLS.mkdir(parents=True, exist_ok=True)
    MOD.write_text(MOD_SRC, encoding="utf-8")
    return f"WRITE {MOD.relative_to(ROOT)}"

def patch_preflight() -> list[str]:
    logs: list[str] = []
    if not PRE.exists():
        return [f"[MISS] {PRE.relative_to(ROOT)} (crea prima Tools/preflight.py)"]

    src = PRE.read_text(encoding="utf-8")
    changed = False

    # 1) import (solo se non presente)
    if "pl_gitignore_check" not in src:
        # inserisci dopo la prima riga di import o in testa
        lines = src.splitlines()
        insert_idx = 0
        for i, ln in enumerate(lines[:30]):
            if ln.strip().startswith("import ") or ln.strip().startswith("from "):
                insert_idx = i + 1
        lines.insert(insert_idx, "from pl_gitignore_check import ensure_gitignore")
        src = "\n".join(lines)
        changed = True
        logs.append("[PATCH] import ensure_gitignore aggiunto")

    # 2) blocco __main__ (aggiungi solo se non già presente la nostra firma)
    if "auto-added by pl6h_gitignore_integration.py" not in src:
        # aggiungi in coda
        if not src.endswith("\n"):
            src += "\n"
        src += APPEND_BLOCK
        changed = True
        logs.append("[APPEND] blocco __main__ per .gitignore")

    if changed:
        PRE.write_text(src, encoding="utf-8")
    else:
        logs.append("[OK] preflight.py già integrato")

    return logs

def main() -> int:
    try:
        print(ensure_module())
        for l in patch_preflight():
            print(l)
        return 0
    except Exception as e:
        print("[ERROR]", e)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
