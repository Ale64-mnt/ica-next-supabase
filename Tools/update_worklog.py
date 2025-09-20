# Tools/update_worklog.py
# Recalcola il totale ore del WORKLOG in modo idempotente.
# - Trova l'ULTIMA intestazione "Totale" (con o senza bullet/emoji/markdown/colon)
# - Somma SOLO le righe "⏱ ..." che la precedono, escludendo i totali di sezione
#   (una riga "⏱ ..." è esclusa se la riga non-vuota precedente contiene "totale")
# - Sostituisce/crea la riga subito successiva con "⏱ {Hh} {Mm}"

from __future__ import annotations
import re
from pathlib import Path
import sys

WORKLOG = Path("worklog.md")

TIME_RX = re.compile(
    r"""^\s*⏱\s*           # bullet timer
        (?:(\d+)\s*h)?     # ore opzionali
        \s*
        (?:(\d+)\s*m)?     # minuti opzionali
        \s*$""",
    re.VERBOSE | re.UNICODE,
)

def parse_minutes(line: str) -> int | None:
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
    if h:
        return f"⏱ {h}h"
    return f"⏱ {m}m"

def is_totale_header(line: str) -> bool:
    """
    Riconosce 'Totale' in varianti:
    - 'Totale'
    - '🔹 Totale'
    - '### Totale:'
    - '* Totale   '
    """
    s = line.strip().lower()
    # togli bullet/markdown/emoji iniziali
    s = s.lstrip("#*-•🔹 ").strip()
    # togli eventuale ':' finale
    s = s[:-1] if s.endswith(":") else s
    return s == "totale"

def main() -> int:
    if not WORKLOG.exists():
        print(f"[ERR] File non trovato: {WORKLOG}", file=sys.stderr)
        return 2

    lines = WORKLOG.read_text(encoding="utf-8", errors="replace").splitlines()

    # 1) trova l'ULTIMA intestazione 'Totale'
    tot_idx = None
    for i in range(len(lines) - 1, -1, -1):
        if is_totale_header(lines[i]):
            tot_idx = i
            break

    if tot_idx is None:
        print("[WARN] Nessuna intestazione 'Totale' trovata. Non modifico nulla.")
        return 0

    # 2) somma le righe "⏱ ..." PRIMA di 'Totale',
    #    ESCLUDENDO quelle che sono subito dopo una riga 'Totale' (totali di sezione)
    total_min = 0
    for i in range(tot_idx):
        minutes = parse_minutes(lines[i])
        if minutes is None:
            continue

        # trova la riga non-vuota precedente
        j = i - 1
        while j >= 0 and lines[j].strip() == "":
            j -= 1
        if j >= 0 and is_totale_header(lines[j]):
            # questa "⏱ ..." è un totale di sezione -> non sommare
            continue

        total_min += minutes

    new_total = fmt_minutes(total_min)

    # 3) sostituisci/crea la riga subito DOPO l'ultima intestazione 'Totale'
    if tot_idx + 1 < len(lines):
        lines[tot_idx + 1] = new_total
    else:
        lines.append(new_total)

    WORKLOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[DONE] Totale aggiornato: {new_total}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
