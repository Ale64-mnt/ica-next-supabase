# -*- coding: utf-8 -*-
r"""
Tools/update_worklog.py

Funzioni:
- Normalizza righe tempo al formato: "⏱ Nh Nm" (sempre con ore e minuti).
- Somma i tempi considerando SOLO la PRIMA riga "⏱ ..." per ciascuna sezione "### 📌 ...".
- Ignora completamente la sezione "🔹 Totale" durante il calcolo.
- Rimuove eventuali blocchi "🔹 Totale" già presenti e ne appende uno unico in fondo.

Uso (Windows):
  .\.venv\Scripts\python.exe Tools\update_worklog.py

Uso (cross-platform):
  python Tools/update_worklog.py
"""

from __future__ import annotations
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

HEADER_PREFIX = "### 📌 "
TOTAL_HEADER = "🔹 Totale"

# Regex per catturare "⏱ ..." e gli eventuali componenti h/m
RE_TIME_LINE = re.compile(r"^\s*⏱\s*(.+?)\s*$")
RE_H = re.compile(r"(\d+)\s*h", re.I)
RE_M = re.compile(r"(\d+)\s*m", re.I)


# ----------------------------- utilità tempo -----------------------------
def to_minutes_from_fragment(fragment: str) -> int:
    """Converte '1h 30m' / '90m' / '2h' in minuti (robusta su spazi)."""
    if not fragment:
        return 0
    h = RE_H.search(fragment)
    m = RE_M.search(fragment)
    hh = int(h.group(1)) if h else 0
    mm = int(m.group(1)) if m else 0
    return hh * 60 + mm


def minutes_to_hm_str(total_min: int) -> str:
    """Ritorna stringa normalizzata 'Nh Nm' con entrambi sempre presenti."""
    total_min = max(0, int(total_min))
    h, m = divmod(total_min, 60)
    return f"{h}h {m}m"


def parse_time_line(line: str) -> int:
    """Se la linea è del tipo '⏱ ...' ritorna i minuti, altrimenti 0."""
    m = RE_TIME_LINE.match(line)
    if not m:
        return 0
    return to_minutes_from_fragment(m.group(1).strip())


def normalize_time_line(line: str) -> str:
    """Se è riga tempo, la riscrive come '⏱ Nh Nm'."""
    m = RE_TIME_LINE.match(line)
    if not m:
        return line
    mins = to_minutes_from_fragment(m.group(1).strip())
    return f"⏱ {minutes_to_hm_str(mins)}"


# ----------------------------- parsing/somma -----------------------------
def normalize_all_time_lines(lines: list[str]) -> list[str]:
    """Normalizza ogni riga '⏱ ...' al formato canonico."""
    out: list[str] = []
    for ln in lines:
        out.append(normalize_time_line(ln) if RE_TIME_LINE.match(ln) else ln)
    return out


def sum_sections_minutes(lines: list[str]) -> int:
    """
    Somma esclusivamente la PRIMA riga '⏱ ...' trovata in ciascuna sezione '### 📌 ...'.
    Ignora completamente tutto ciò che segue '🔹 Totale'.
    """
    total = 0
    in_section = False
    seen_time_in_section = False
    in_total_block = False

    for raw in lines:
        ln = raw.rstrip("\n")

        # blocco Totale: non conteggiare più nulla
        if ln.strip().startswith(TOTAL_HEADER):
            in_total_block = True
            in_section = False
            seen_time_in_section = False
            continue
        if in_total_block:
            continue

        # nuova sezione attività
        if ln.startswith(HEADER_PREFIX):
            in_section = True
            seen_time_in_section = False
            continue

        if in_section and not seen_time_in_section:
            minutes = parse_time_line(ln)
            if minutes > 0:
                total += minutes
                seen_time_in_section = True  # conta solo la prima riga tempo della sezione

    return total


def remove_existing_total_block(lines: list[str]) -> list[str]:
    """
    Rimuove qualsiasi blocco '🔹 Totale' esistente (header + righe successive
    finché non troviamo una riga completamente vuota).
    """
    out: list[str] = []
    skipping = False
    for ln in lines:
        if ln.strip().startswith(TOTAL_HEADER):
            skipping = True
            continue
        if skipping:
            if not ln.strip():  # riga vuota = fine blocco totale
                skipping = False
            continue
        out.append(ln)
    # trim finali
    while out and not out[-1].strip():
        out.pop()
    return out


def write_total_block(lines: list[str], total_min: int) -> list[str]:
    """Appende blocco unico '🔹 Totale' in fondo al file."""
    out = lines[:]
    if out and out[-1].strip():
        out.append("")
    out.append(TOTAL_HEADER)
    out.append("")
    out.append(f"⏱ {minutes_to_hm_str(total_min)}")
    out.append("")
    return out


# ----------------------------- main -----------------------------
def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERROR] worklog non trovato: {WORKLOG}")
        return 2

    content = WORKLOG.read_text(encoding="utf-8-sig")
    lines = content.splitlines()

    # 1) normalizza TUTTE le righe tempo
    lines = normalize_all_time_lines(lines)

    # 2) somma robuste: prima ⏱ per sezione, ignora '🔹 Totale'
    total_min = sum_sections_minutes(lines)

    # 3) rimuovi vecchi blocchi Totale
    lines = remove_existing_total_block(lines)

    # 4) append nuovo blocco Totale
    lines = write_total_block(lines, total_min)

    WORKLOG.write_text("\n".join(lines), encoding="utf-8")
    print(f"[DONE] Totale aggiornato: {minutes_to_hm_str(total_min)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
