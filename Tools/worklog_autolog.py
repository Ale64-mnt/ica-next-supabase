# -*- coding: utf-8 -*-
"""
worklog_autolog.py
Gestisce il worklog in modo standardizzato:
- Aggiunge/aggiorna una sezione fase (header + bullet + tempo)
- Evita duplicati
- Aggiorna la sezione '🔹 Totale' (una sola, in fondo)

Uso:
  python Tools/worklog_autolog.py --phase PL-6h --title "Gitignore integration" --time "15m" --date 2025-09-20 --bullets "creato modulo check;;patch preflight auto-fix"
"""

from __future__ import annotations
from pathlib import Path
import argparse
import re
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

RE_H = re.compile(r"(\d+)\s*h", re.I)
RE_M = re.compile(r"(\d+)\s*m", re.I)

def parse_minutes(s: str) -> int:
    h = 0
    m = 0
    mh = RE_H.search(s or "")
    mm = RE_M.search(s or "")
    if mh:
        h = int(mh.group(1))
    if mm:
        m = int(mm.group(1))
    return h * 60 + m

def minutes_to_str(total: int) -> str:
    h, m = divmod(total, 60)
    if h and m: return f"{h}h {m}m"
    if h: return f"{h}h"
    return f"{m}m"

def sum_all_minutes(lines: list[str]) -> int:
    """Somma tutte le durate prima della sezione '🔹 Totale'."""
    total = 0
    upto = len(lines)
    for i, ln in enumerate(lines):
        if ln.strip().startswith("🔹 Totale"):
            upto = i
            break
    for ln in lines[:upto]:
        total += parse_minutes(ln)
    return total

def ensure_section(lines: list[str], day: str, phase: str, title: str, bullets: list[str], time_str: str) -> list[str]:
    header = f"### 📌 {day} – {phase} – {title}"
    text = "\n".join(lines)

    if header in text:
        # già esiste: se manca il tempo, aggiungilo; se manca un bullet, aggiungilo
        out: list[str] = []
        in_section = False
        seen_time = False
        seen_bullets = {b.strip() for b in bullets if b.strip()}
        present_bullets: set[str] = set()

        for ln in lines:
            if ln.strip() == header:
                in_section = True
                seen_time = False
                present_bullets = set()
                out.append(ln)
                continue

            if in_section:
                if ln.startswith("### 📌 ") or ln.strip().startswith("🔹 Totale"):
                    # chiusura sezione: inserisci ciò che manca prima di chiudere
                    for b in bullets:
                        b = b.strip()
                        if b and b not in present_bullets:
                            out.append(f"- {b}")
                    if not seen_time:
                        out.append(f"⏱ {time_str}")
                    in_section = False

            if in_section:
                # traccia bullet esistenti e se c'è la riga tempo
                if ln.strip().startswith("⏱"):
                    seen_time = True
                if ln.strip().startswith("- "):
                    present_bullets.add(ln.strip()[2:].strip())
                out.append(ln)
            else:
                out.append(ln)

        # se il file finisce dentro la sezione, chiudi inserendo eventuali mancanze
        if in_section:
            for b in bullets:
                b = b.strip()
                if b and b not in present_bullets:
                    out.append(f"- {b}")
            if not seen_time:
                out.append(f"⏱ {time_str}")
        return out

    # sezione nuova → aggiungi in fondo
    while lines and not lines[-1].strip():
        lines.pop()
    lines.append("")
    lines.append(header)
    for b in bullets:
        if b.strip():
            lines.append(f"- {b.strip()}")
    lines.append(f"⏱ {time_str}")
    return lines

def rewrite_total(lines: list[str]) -> list[str]:
    # rimuovi qualsiasi sezione Totale esistente
    cleaned: list[str] = []
    skip = False
    for ln in lines:
        if ln.strip().startswith("🔹 Totale"):
            skip = True
            continue
        if skip:
            # salta fino a riga vuota successiva o fine
            if not ln.strip():
                skip = False
            continue
        cleaned.append(ln)

    # pulisci trailing blank
    while cleaned and not cleaned[-1].strip():
        cleaned.pop()

    # somma e scrivi il nuovo totale
    total_min = sum_all_minutes(cleaned)
    total_str = minutes_to_str(total_min)
    cleaned.append("")
    cleaned.append("🔹 Totale")
    cleaned.append("")
    cleaned.append(f"⏱ {total_str}")
    cleaned.append("")
    return cleaned

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--phase", required=True, help="es. PL-6h")
    ap.add_argument("--title", required=True, help="Titolo sintetico fase")
    ap.add_argument("--time", required=True, help="Durata es. '30m' o '1h 15m'")
    ap.add_argument("--date", default=str(date.today()), help="YYYY-MM-DD (default: oggi)")
    ap.add_argument("--bullets", default="", help="bullet separati da ';;'")
    args = ap.parse_args()

    bullets = [b.strip() for b in args.bullets.split(";;")] if args.bullets else []

    # leggi worklog
    text = WORKLOG.read_text(encoding="utf-8-sig") if WORKLOG.exists() else "# Worklog – ICA Next.js + Supabase\n"
    lines = text.splitlines()

    lines = ensure_section(lines, args.date, args.phase, args.title, bullets, args.time)
    lines = rewrite_total(lines)

    WORKLOG.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Inserita/aggiornata sezione: {args.date} – {args.phase} – {args.title} ({args.time})")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
