# -*- coding: utf-8 -*-
"""
worklog_append.py
Aggiorna il file WORKLOG.md (stile narrativo già esistente).
- Aggiunge una nuova sezione con data, fase, descrizione e tempo ⏱.
- Aggiorna la riga "Totale ore registrate" incrementando il monte ore.
"""

from __future__ import annotations
import argparse
from datetime import date
from pathlib import Path
import re

ROOT = Path(".").resolve()
WORKLOG = ROOT / "WORKLOG.md"

def parse_time_to_minutes(s: str) -> int:
    """Converte '1h 30m', '45m', '2h' in minuti."""
    h, m = 0, 0
    s = s.strip().lower()
    h_match = re.search(r"(\d+)\s*h", s)
    m_match = re.search(r"(\d+)\s*m", s)
    if h_match: h = int(h_match.group(1))
    if m_match: m = int(m_match.group(1))
    return h * 60 + m

def minutes_to_str(total: int) -> str:
    h, m = divmod(total, 60)
    if h and m:
        return f"{h}h {m}m"
    elif h:
        return f"{h}h"
    else:
        return f"{m}m"

def update_worklog(phase: str, desc: str, time_str: str):
    if not WORKLOG.exists():
        raise FileNotFoundError(f"{WORKLOG} non trovato")

    text = WORKLOG.read_text(encoding="utf-8").splitlines()

    # calcola nuovo totale
    total_minutes = 0
    for line in text:
        if line.strip().startswith("## Totale ore registrate"):
            m = re.search(r"(\d+)h(?:\s*(\d+)m)?", line)
            if m:
                h = int(m.group(1))
                mm = int(m.group(2) or 0)
                total_minutes = h * 60 + mm
            break

    add_minutes = parse_time_to_minutes(time_str)
    new_total = total_minutes + add_minutes

    # aggiorna riga Totale ore registrate (ultima trovata)
    for i, line in enumerate(text):
        if line.strip().startswith("## Totale ore registrate"):
            text[i] = f"## Totale ore registrate: {minutes_to_str(new_total)}"
            break

    # aggiungi nuova sezione
    today = date.today().isoformat()
    entry = [
        f"### 📌 {today} – {phase}",
        f"- {desc}",
        f"⏱ {time_str}"
    ]
    text.extend(entry)

    WORKLOG.write_text("\n".join(text) + "\n", encoding="utf-8")
    print(f"[OK] Aggiunta voce: {today} – {phase} – {time_str}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", required=True, help="Es: PL-6f – Fix NewsList")
    ap.add_argument("--time", required=True, help="Es: 1h, 30m, 1h 15m")
    ap.add_argument("--desc", required=True, help="Descrizione attività")
    args = ap.parse_args()
    update_worklog(args.phase, args.desc, args.time)

if __name__ == "__main__":
    main()
