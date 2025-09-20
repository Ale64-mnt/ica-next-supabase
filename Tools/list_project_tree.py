# tools/list_project_tree.py
"""
Stampa l'albero delle cartelle principali del progetto (webapp/)
e lo salva su file UTF-8 (di default: tree.txt) per evitare problemi di encoding su Windows.

Uso:
  .\.venv\Scripts\python.exe tools\list_project_tree.py --out tree.txt
"""

from __future__ import annotations
import argparse
from pathlib import Path

# Cartella radice del progetto (questa repo)
REPO_ROOT = Path(__file__).resolve().parents[1]
WEBAPP = REPO_ROOT / "webapp"
INCLUDE_DIRS = ("app", "components", "lib", "messages")
INCLUDE_EXTS = {".ts", ".tsx", ".json"}

ASCII_BRANCH = "+-- "
ASCII_PIPE = "|   "
ASCII_SPACE = "    "

def list_entries(base: Path):
    # Solo dir e file con estensioni interessanti, esclusi node_modules/.next
    skip_dirs = {"node_modules", ".next", ".git", ".vercel"}
    entries = []
    for p in base.iterdir():
        if p.is_dir():
            if p.name in skip_dirs:
                continue
            entries.append(p)
        elif p.suffix in INCLUDE_EXTS:
            entries.append(p)
    return sorted(entries, key=lambda p: (not p.is_dir(), p.name.lower()))

def build_tree(base: Path, prefix: str = "") -> list[str]:
    lines: list[str] = []
    entries = list_entries(base)
    for i, p in enumerate(entries):
        is_last = i == len(entries) - 1
        connector = ASCII_BRANCH
        lines.append(f"{prefix}{connector}{p.name}")
        if p.is_dir():
            next_prefix = prefix + (ASCII_SPACE if is_last else ASCII_PIPE)
            lines.extend(build_tree(p, next_prefix))
    return lines

def main():
    parser = argparse.ArgumentParser(description="Esporta l'albero cartelle/file (webapp) su file UTF-8.")
    parser.add_argument("--out", default="tree.txt", help="Percorso output (default: tree.txt nella repo)")
    args = parser.parse_args()

    out_path = (REPO_ROOT / args.out).resolve()

    if not WEBAPP.exists():
        raise SystemExit(f"[ERR] Cartella non trovata: {WEBAPP}")

    lines: list[str] = []
    lines.append(f"[ROOT] {WEBAPP.as_posix()}")
    for sub in INCLUDE_DIRS:
        path = WEBAPP / sub
        if not path.exists():
            continue
        lines.append(f"\n=== {sub} ===")
        lines.extend(build_tree(path))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")

    print(f"[OK] Albero scritto in: {out_path}")

if __name__ == "__main__":
    main()
