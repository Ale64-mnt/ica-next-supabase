# Tools/update_worklog.py
# Recalcola il totale ore del WORKLOG in modo idempotente.
# Regole:
# - cerca l'ULTIMA intestazione "Totale" (bullet/emoji/###/spazi/: tollerati)
# - ricalcola la somma delle righe "⏱ ..." che la precedono
# - sostituisce la riga successiva con "⏱ {Hh} {Mm}" corretta
# - ignora qualsiasi "⏱ ..." successiva alla sezione Totale (è il totale corrente)
# - tollera formati: "⏱ 15m", "⏱ 1h", "⏱ 1h 30m", "⏱ 1h 0m", spazi vari

from __future__ import annotations
import re
from pathlib import Path
import sys

WORKLOG = Path("worklog.md")

# Match timer lines
TIME_RX = re.compile(
    r"""^\s*⏱\s*      # bullet timer
        (?:(\d+)\s*h)? # ore opzionali
        \s*
        (?:(\d+)\s*m)? # minuti opzionali
        \s*$""",
    re.VERBOSE | re.UNICODE,
)

# Match "Totale" header (robusto)
TOT_RX = re.compile(
    r'^\s*(?:[#*\-\u2022\u25CF\u25AA\u25C6\ud83d\udd39\u2753\u2756\u26a0\ufe0f]*)\s*totale\s*:?\s*$',
    re.IGNORECASE
)

def parse_minutes(line: str) -> int | None:
    """Converte '⏱ 1h 30m' o '⏱ 15m' o '⏱ 2h' in minuti totali, altrimenti None."""
    m = TIME_RX.match(line)
    if not m:
        return None
    h = int(m.group(1)) if m.group(1) else 0
    mm = int(m.group(2)) if m.group(2) else 0
    return h * 60 + mm

def fmt_minutes(total_min: int) -> str:
    h, m = divmod(total_min, 60)
    if h and m:
        return f"⏱ {h}h {m}m"
    if h and not m:
        return f"⏱ {h}h"
    return f"⏱ {m}m"

def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERR] File non trovato: {WORKLOG}", file=sys.stderr)
        return 2

    text = WORKLOG.read_text(encoding="utf-8", errors="replace").splitlines()

    # 1) trova l'ULTIMA intestazione "Totale"
    tot_idx = None
    for i in range(len(text) - 1, -1, -1):
        if TOT_RX.match(text[i]):
            tot_idx = i
            break

    if tot_idx is None:
        print("[WARN] Nessuna intestazione 'Totale' trovata. Non modifico nulla.")
        return 0

    # 2) somma tutte le righe "⏱ ..." PRIMA di 'Totale'
    total_min = sum(
        parse_minutes(line) or 0
        for line in text[:tot_idx]
    )

    new_total_line = fmt_minutes(total_min)

    # 3) la riga successiva a 'Totale' -> sovrascrivi o aggiungi
    if tot_idx + 1 < len(text):
        text[tot_idx + 1] = new_total_line
    else:
        text.append(new_total_line)

    WORKLOG.write_text("\n".join(text) + "\n", encoding="utf-8")
    print(f"[DONE] Totale aggiornato: {new_total_line}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
