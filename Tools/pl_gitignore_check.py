# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GITIGNORE = ROOT / ".gitignore"

BLOCK = """# === Node / Next.js ===
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
"""


def ensure_gitignore(auto_fix: bool = True) -> tuple[str, int]:
    """Controlla/aggiorna .gitignore. Ritorna (status, added_count).
    status: 'OK' | 'PATCH' | 'MISSING'
    """
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
        GITIGNORE.write_text("\n".join(merged) + "\n", encoding="utf-8")
        return ("PATCH", added)
    elif added:
        return ("MISSING", added)
    else:
        return ("OK", 0)
