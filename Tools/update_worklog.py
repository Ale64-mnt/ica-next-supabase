# -*- coding: utf-8 -*-
"""
update_worklog.py
- Somma SOLO i '⏱ …' delle sezioni '### 📌 …'
- Riscrive una sola sezione '🔹 Totale' in fondo
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

def sum_sections(lines: list[str]) -> int:
    total = 0
    in_sec = False
    for ln in lines:
        if ln.startswith("### 📌 "):
            in_sec = True
            continue
        if in_sec and (ln.startswith("### 📌 ") or ln.strip().startswith("🔹 Totale")):
            in_sec = False
        if in_sec and ln.strip().startswith("⏱"):
            total += to_minutes(ln)
    return total

def rewrite_total(lines: list[str], total_min: int) -> list[str]:
    cleaned: list[str] = []
    skip = False
    for ln in lines:
        if ln.strip().startswith("🔹 Totale"):
            skip = True
            continue
        if skip:
            if not ln.strip():
                skip = False
            continue
        cleaned.append(ln)
    while cleaned and not cleaned[-1].strip():
        cleaned.pop()
    cleaned.append("")
    cleaned.append("🔹 Totale")
    cleaned.append("")
    cleaned.append(f"⏱ {fmt(total_min)}")
    cleaned.append("")
    return cleaned

def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERROR] Non trovo {WORKLOG}")
        return 2
    content = WORKLOG.read_text(encoding="utf-8-sig")
    lines = content.splitlines()
    total_min = sum_sections(lines)
    new_lines = rewrite_total(lines, total_min)
    WORKLOG.write_text("\n".join(new_lines), encoding="utf-8")
    print(f"[DONE] Totale aggiornato: {fmt(total_min)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
