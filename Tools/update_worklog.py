# tools/update_worklog.py
# -*- coding: utf-8 -*-
"""
Aggiorna automaticamente worklog.md:
- inserisce una nuova voce (titolo, durata, note)
- garantisce la presenza delle sezioni
- ricalcola il totale complessivo (sommando tutte le righe con "⏱️ ...")
Uso:
  .\.venv\Scripts\python.exe tools\update_worklog.py --title "PL-3 – Tailwind v4 fix" --duration "36m" --notes "postcss/tailwind config" --group "Pre-lancio (PL)"

Gruppi supportati:
  - "Fasi principali"
  - "Pre-lancio (PL)"
  - "Altro"
"""

from __future__ import annotations
import argparse, re
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[1]
WORKLOG = ROOT / "worklog.md"

HEADER = "# Registro Lavoro\n"
SECTION_ORDER = ["Fasi principali", "Pre-lancio (PL)", "Altro"]
TOTAL_SECTION = "## Totale ore lavorate"

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Aggiorna worklog.md con una nuova voce e ricalcola il totale.")
    p.add_argument("--title", required=True, help="Titolo voce (es: 'PL-3 – Tailwind v4 fix')")
    p.add_argument("--duration", required=True, help="Durata (es: '2h 45m', '50m', '1h')")
    p.add_argument("--notes", default="", help="Note opzionali (descrizione su riga successiva)")
    p.add_argument("--group", default="Pre-lancio (PL)", choices=SECTION_ORDER, help="Sezione di destinazione")
    p.add_argument("--dry-run", action="store_true", help="Mostra l'output senza scrivere su file")
    return p.parse_args()

def ensure_structure(lines: List[str]) -> List[str]:
    if not lines or not any(l.strip().startswith("# Registro Lavoro") for l in lines):
        # crea scheletro base
        base: List[str] = [HEADER, "\n"]
        for sect in SECTION_ORDER:
            base.append(f"## {sect}\n\n")
        base.append(f"{TOTAL_SECTION}\n\n**Totale complessivo: 0h 0m**\n")
        return base
    # assicura che tutte le sezioni esistano (nell'ordine definito)
    existing_sections = [i for i, l in enumerate(lines) if l.strip().startswith("## ")]
    present = {l.strip()[3:]: i for i, l in enumerate(lines) if l.strip().startswith("## ")}
    insert_at = len(lines)
    for sect in SECTION_ORDER:
        if sect not in present:
            lines.append(f"\n## {sect}\n\n")
    if not any(l.strip().startswith(TOTAL_SECTION) for l in lines):
        lines.append(f"\n{TOTAL_SECTION}\n\n**Totale complessivo: 0h 0m**\n")
    return lines

def find_section_bounds(lines: List[str], section_name: str) -> Tuple[int, int]:
    start = None
    for i, l in enumerate(lines):
        if l.strip() == f"## {section_name}":
            start = i
            break
    if start is None:
        # caller deve assicurare struttura
        raise RuntimeError("Sezione non trovata dopo ensure_structure()")
    # fine = prossima sezione "## " o TOTAL_SECTION o EOF
    end = len(lines)
    for j in range(start + 1, len(lines)):
        if lines[j].strip().startswith("## "):
            end = j
            break
    return start, end

def format_entry(title: str, duration: str, notes: str) -> List[str]:
    # normalizza durata (spazi coerenti)
    dur = normalize_duration(duration)
    out = [f"- **{title}**  \n", f"  ⏱️ {dur}\n"]
    if notes.strip():
        out.insert(1, f"  {notes.strip()}\n")
    return out

def normalize_duration(d: str) -> str:
    d = d.strip().lower().replace(" ", "")
    # supporta "2h45m", "2h", "45m"
    h = 0
    m = 0
    m_h = re.search(r"(\d+)h", d)
    m_m = re.search(r"(\d+)m", d)
    if m_h:
        h = int(m_h.group(1))
    if m_m:
        m = int(m_m.group(1))
    return f"{h}h {m}m"

def insert_entry(lines: List[str], group: str, entry_lines: List[str]) -> List[str]:
    # inserisci la voce PRIMA della sezione Totale, alla fine del gruppo
    start, end = find_section_bounds(lines, group)
    insert_at = end
    # evita di inserire sopra un header di sezione successiva
    # garantisci una riga vuota prima della nuova voce
    if insert_at > 0 and (insert_at >= len(lines) or lines[insert_at-1].strip() != ""):
        entry_lines = ["\n"] + entry_lines
    lines[insert_at:insert_at] = entry_lines
    return lines

def sum_total_minutes(lines: List[str]) -> int:
    total = 0
    # match "⏱️ Xh Ym" | "⏱️ Xm" | "⏱️ Xh"
    DUR_RE_1 = re.compile(r"⏱️\s*(\d+)\s*h\s*(\d+)\s*m", re.I)
    DUR_RE_2 = re.compile(r"⏱️\s*(\d+)\s*h(?!\s*m)", re.I)
    DUR_RE_3 = re.compile(r"⏱️\s*(\d+)\s*m", re.I)
    for l in lines:
        l = l.strip()
        m1 = DUR_RE_1.search(l)
        if m1:
            total += int(m1.group(1)) * 60 + int(m1.group(2))
            continue
        m2 = DUR_RE_2.search(l)
        if m2:
            total += int(m2.group(1)) * 60
            continue
        m3 = DUR_RE_3.search(l)
        if m3:
            total += int(m3.group(1))
            continue
    return total

def update_total_section(lines: List[str], total_minutes: int) -> List[str]:
    h = total_minutes // 60
    m = total_minutes % 60
    total_line = f"**Totale complessivo: {h}h {m}m**\n"
    # trova sezione totale
    total_idx = None
    for i, l in enumerate(lines):
        if l.strip().startswith(TOTAL_SECTION):
            total_idx = i
            break
    if total_idx is None:
        # append sezione totale
        lines.append(f"\n{TOTAL_SECTION}\n\n{total_line}")
        return lines
    # trova riga del totale esistente (prima riga in bold dopo il titolo sezione)
    j = total_idx + 1
    # salta linee vuote
    while j < len(lines) and lines[j].strip() == "":
        j += 1
    if j < len(lines) and lines[j].strip().startswith("**Totale complessivo:"):
        lines[j] = total_line
    else:
        # inserisci
        lines[total_idx+1:total_idx+1] = ["\n", total_line]
    return lines

def main():
    args = parse_args()
    text = WORKLOG.read_text(encoding="utf-8") if WORKLOG.exists() else ""
    lines = text.splitlines(keepends=True)
    lines = ensure_structure(lines)
    # prepara entry
    entry = format_entry(args.title, args.duration, args.notes)
    # inserisci
    lines = insert_entry(lines, args.group, entry)
    # ricalcola totale
    tot_min = sum_total_minutes(lines)
    lines = update_total_section(lines, tot_min)
    out = "".join(lines)
    if args.dry_run:
        print(out)
        return
    WORKLOG.write_text(out, encoding="utf-8", newline="\n")
    print(f"[OK] Aggiornato {WORKLOG} – totale ora: {tot_min//60}h {tot_min%60}m")

if __name__ == "__main__":
    main()
