# -*- coding: utf-8 -*-
"""
worklog_normalize_sections.py
- Normalizza le sezioni '### 📌 …':
  * sposta tutte le righe '⏱ …' in fondo alla sezione
  * se ce ne sono più di una, le somma in una sola riga
- Non tocca la tabellina legacy iniziale
- Non riscrive '🔹 Totale' (lasciato a update_worklog.py)
"""

from __future__ import annotations
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

RE_H = re.compile(r"(\d+)\s*h", re.I)
RE_M = re.compile(r"(\d+)\s*m", re.I)

def to_minutes(s: str) -> int:
    mh = RE_H.search(s or "")
    mm = RE_M.search(s or "")
    h = int(mh.group(1)) if mh else 0
    m = int(mm.group(1)) if mm else 0
    return h*60 + m

def fmt(mm: int) -> str:
    h, m = divmod(mm, 60)
    if h and m: return f"{h}h {m}m"
    if h: return f"{h}h"
    return f"{m}m"

def normalize(lines: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        ln = lines[i]
        if ln.startswith("### 📌 "):
            block = [ln]
            i += 1
            while i < n and not lines[i].startswith("### 📌 ") and not lines[i].strip().startswith("🔹 Totale"):
                block.append(lines[i])
                i += 1
            # separa tempo
            body: list[str] = []
            tot = 0
            for b in block[1:]:
                if b.strip().startswith("⏱"):
                    tot += to_minutes(b)
                else:
                    body.append(b)
            while body and not body[-1].strip():
                body.pop()
            out.append(block[0])
            out.extend(body)
            out.append(f"⏱ {fmt(tot)}" if tot > 0 else "⏱ 0m")
            out.append("")
        else:
            out.append(ln)
            i += 1
    return out

def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERROR] Non trovo {WORKLOG}")
        return 2
    content = WORKLOG.read_text(encoding="utf-8-sig")
    lines = content.splitlines()
    new_lines = normalize(lines)
    WORKLOG.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
    print("[OK] Sezioni normalizzate (tempo a fine sezione).")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
