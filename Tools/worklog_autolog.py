# -*- coding: utf-8 -*-
"""
worklog_autolog.py
- Crea/aggiorna una sezione fase nel worklog in formato standard
- La riga '⏱ <durata>' viene SEMPRE messa in fondo alla sezione
- Non tocca la sezione '🔹 Totale' (lasciata ai tool di normalizzazione/somma)

Uso:
  python Tools/worklog_autolog.py --phase PL-6h --title "Gitignore integration" --time "15m" --date 2025-09-20 --bullets "creato modulo;;patch preflight"
"""

from __future__ import annotations
from pathlib import Path
from datetime import date
import argparse
import re

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

RE_H = re.compile(r"(\d+)\s*h", re.I)
RE_M = re.compile(r"(\d+)\s*m", re.I)

def parse_minutes(s: str) -> int:
    h = RE_H.search(s or "")
    m = RE_M.search(s or "")
    hh = int(h.group(1)) if h else 0
    mm = int(m.group(1)) if m else 0
    return hh * 60 + mm

def minutes_to_str(n: int) -> str:
    h, m = divmod(n, 60)
    if h and m: return f"{h}h {m}m"
    if h: return f"{h}h"
    return f"{m}m"

def ensure_section(lines: list[str], d: str, phase: str, title: str, bullets: list[str], time_str: str) -> list[str]:
    header = f"### 📌 {d} – {phase} – {title}"
    # se il file è vuoto, preparalo con il titolo
    if not lines:
        lines = [f"# Worklog – ICA Next.js + Supabase", ""]

    text = "\n".join(lines)
    if header not in text:
        # nuova sezione → append in fondo, prima del blocco Totale (se presente)
        # rimuovi eventuali blank finali
        while lines and not lines[-1].strip():
            lines.pop()
        # se c'è già il blocco “🔹 Totale”, lo tagliamo e lo riaggiungeremo dopo con update_worklog
        if any(ln.strip().startswith("🔹 Totale") for ln in lines):
            # taglia tutto da '🔹 Totale' in poi
            cut = []
            for ln in lines:
                if ln.strip().startswith("🔹 Totale"):
                    break
                cut.append(ln)
            lines = cut
        # scrivi nuova sezione
        lines.append("")
        lines.append(header)
        for b in bullets:
            b = b.strip()
            if b:
                lines.append(f"- {b}")
        lines.append(f"⏱ {time_str}")
        lines.append("")
        return lines

    # sezione esiste: consolidiamo bullets e mettiamo ⏱ in fondo
    out: list[str] = []
    i = 0
    n = len(lines)
    in_sec = False
    sec_buf: list[str] = []
    while i < n:
        ln = lines[i]
        if ln.strip() == header:
            # dump vecchia sezione (se ne avessimo in buf, improbabile qui)
            if sec_buf:
                out.extend(sec_buf)
                sec_buf = []
            # entra in sezione target
            in_sec = True
            out.append(ln)
            i += 1
            # raccogli corpo fino alla prossima sezione o totale
            body: list[str] = []
            while i < n and not lines[i].startswith("### 📌 ") and not lines[i].strip().startswith("🔹 Totale"):
                body.append(lines[i])
                i += 1
            # separa ⏱ esistenti e bullets esistenti
            seen_bullets = set()
            existing_time_min = 0
            new_body: list[str] = []
            for b in body:
                if b.strip().startswith("⏱"):
                    existing_time_min += parse_minutes(b)
                elif b.strip().startswith("- "):
                    seen_bullets.add(b.strip()[2:].strip())
                    new_body.append(b)
                else:
                    new_body.append(b)
            # aggiungi bullets mancanti
            for b in bullets:
                b = b.strip()
                if b and b not in seen_bullets:
                    new_body.append(f"- {b}")
                    seen_bullets.add(b)
            # tempo finale = esistente + nuovo
            total_min = existing_time_min + parse_minutes(time_str)
            # ripulisci blank finali
            while new_body and not new_body[-1].strip():
                new_body.pop()
            out.extend(new_body)
            out.append(f"⏱ {minutes_to_str(total_min)}")
            out.append("")
            in_sec = False
            continue

        # righe fuori dalla sezione target: copiale
        out.append(ln)
        i += 1

    return out

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--time", required=True)   # "15m" | "1h 30m"
    ap.add_argument("--date", default=str(date.today()))
    ap.add_argument("--bullets", default="")   # "punto1;;punto2"
    args = ap.parse_args()

    bullets = [b.strip() for b in args.bullets.split(";;")] if args.bullets else []

    content = WORKLOG.read_text(encoding="utf-8-sig") if WORKLOG.exists() else ""
    lines = content.splitlines()

    lines = ensure_section(lines, args.date, args.phase, args.title, bullets, args.time)

    # scrivi (senza toccare il blocco Totale, che verrà riscritto dall'altro tool)
    WORKLOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[OK] Inserita/aggiornata sezione: {args.date} – {args.phase} – {args.title} ({args.time})")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
