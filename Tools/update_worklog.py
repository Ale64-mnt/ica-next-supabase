# -*- coding: utf-8 -*-
"""
update_worklog.py
Aggiorna il totale ore in worklog.md in modo idempotente.

Come funziona
- Legge worklog.md (UTF-8, BOM tollerato)
- Calcola la somma delle durate presenti PRIMA della sezione "🔹 Totale"
  (quindi ignora eventuali totali già presenti)
- Durate riconosciute in formato:
    ⏱ 30m
    ⏱ 2h
    ⏱ 1h 45m
- Riscrive/ricrea la sezione finale:
      🔹 Totale

      ⏱ <HHh MMm>   (oppure solo Hh o solo Mm)
"""

from __future__ import annotations
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

# pattern durate: ore e minuti opzionali, nell'ordine classico
RE_H = re.compile(r"(\d+)\s*h", flags=re.IGNORECASE)
RE_M = re.compile(r"(\d+)\s*m", flags=re.IGNORECASE)

def parse_line_minutes(line: str) -> int:
    """Estrae minuti da una riga che contiene una durata (ore/minuti)."""
    # prendi la PRIMA occorrenza di ore e/o minuti
    h = 0
    m = 0
    mh = RE_H.search(line)
    mm = RE_M.search(line)
    if mh:
        try:
            h = int(mh.group(1))
        except ValueError:
            h = 0
    if mm:
        try:
            m = int(mm.group(1))
        except ValueError:
            m = 0
    return h * 60 + m

def format_minutes(total_min: int) -> str:
    h, m = divmod(total_min, 60)
    if h and m:
        return f"{h}h {m}m"
    if h:
        return f"{h}h"
    return f"{m}m"

def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERROR] File non trovato: {WORKLOG}")
        return 2

    # Leggi tollerando BOM
    content = WORKLOG.read_text(encoding="utf-8-sig")
    lines = content.splitlines()

    # Trova eventuale sezione "🔹 Totale" per escluderla dal conteggio
    totale_idx = None
    for i, ln in enumerate(lines):
        if ln.strip().startswith("🔹 Totale"):
            totale_idx = i
            break

    # Somma tutte le ⏱ prima di "🔹 Totale" (se esiste), altrimenti su tutto
    scan_upto = totale_idx if totale_idx is not None else len(lines)
    total_minutes = 0
    for ln in lines[:scan_upto]:
        if "⏱" in ln:
            total_minutes += parse_line_minutes(ln)

    total_str = format_minutes(total_minutes)

    # Rimuovi qualsiasi sezione "🔹 Totale" esistente (dalla prima occorrenza in poi)
    if totale_idx is not None:
        lines = lines[:totale_idx]

    # Ripulisci eventuali righe vuote in coda
    while lines and not lines[-1].strip():
        lines.pop()

    # Aggiungi sezione totale standardizzata
    lines.append("")
    lines.append("🔹 Totale")
    lines.append("")
    lines.append(f"⏱ {total_str}")
    lines.append("")  # newline finale

    WORKLOG.write_text("\n".join(lines), encoding="utf-8")
    print(f"[DONE] Totale aggiornato: {total_str}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
