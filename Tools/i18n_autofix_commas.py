# tools/i18n_autofix_commas.py
# -*- coding: utf-8 -*-
"""
Auto-fix JSON i18n:
- Rimuove BOM, commenti // e /* ... */
- Aggiunge la virgola mancante tra oggetti top-level: `} "key"` -> `}, "key"`
- Verifica la validità JSON; se fallisce mostra contesto.
- Crea backup .bak-YYYYMMDD-HHMMSS prima di scrivere.
"""

from __future__ import annotations
import json, re, sys
from pathlib import Path
from datetime import datetime

REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"
MESSAGES = WEBAPP / "messages"
TARGETS = [MESSAGES / "it.json", MESSAGES / "en.json"]

RE_LINE_COMMENTS = re.compile(r'(^|[^:])//.*?$', re.MULTILINE)
RE_BLOCK_COMMENTS = re.compile(r'/\*.*?\*/', re.DOTALL)
RE_TRAIL_COMMA_OBJ = re.compile(r',\s*}', re.MULTILINE)
RE_TRAIL_COMMA_ARR = re.compile(r',\s*]', re.MULTILINE)
# Inserisce virgola quando trova: } [spazi/newline] "
RE_MISSING_COMMA_BETWEEN_TOP = re.compile(r'}\s*"', re.MULTILINE)

def _strip_bom(s: str) -> str:
    return s.lstrip("\ufeff")

def _rm_comments(s: str) -> str:
    s = RE_BLOCK_COMMENTS.sub("", s)
    s = RE_LINE_COMMENTS.sub(lambda m: (m.group(1) or ""), s)
    return s

def _fix_trailing_commas(s: str) -> str:
    prev = None
    while s != prev:
        prev = s
        s = RE_TRAIL_COMMA_OBJ.sub("}", s)
        s = RE_TRAIL_COMMA_ARR.sub("]", s)
    return s

def _fix_missing_commas_between_top(s: str) -> str:
    # Evita di toccare il caso in cui il file termina con "}"
    # Sostituiamo solo quando dopo la " c'è un identificatore di chiave (lettera/underscore)
    return RE_MISSING_COMMA_BETWEEN_TOP.sub('},\n"', s)

def _now() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def _backup(p: Path) -> Path:
    b = p.with_suffix(p.suffix + f".bak-{_now()}")
    b.write_bytes(p.read_bytes())
    return b

def _validate_or_die(p: Path, text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        lines = text.splitlines()
        ln = e.lineno or 1
        start = max(1, ln - 5)
        end = min(len(lines), ln + 5)
        print(f"\n[ERR] JSON non valido: {p}")
        print(f"      {e.msg} (line {e.lineno}, col {e.colno})")
        print("------ contesto ------")
        for i in range(start, end + 1):
            mark = ">>" if i == ln else "  "
            print(f"{mark} {i:04d}: {lines[i-1]}")
        print("----------------------\n")
        raise

def process(p: Path) -> None:
    if not p.exists():
        print(f"[SKIP] File non trovato: {p}")
        return
    raw = p.read_text(encoding="utf-8-sig")
    s = _strip_bom(raw)
    s = _rm_comments(s)
    s = _fix_trailing_commas(s)
    s = _fix_missing_commas_between_top(s)

    # Prova a validare
    _validate_or_die(p, s)

    # Scrivi con backup e formattazione pulita
    _backup(p)
    data = json.loads(s)
    with p.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")
    print(f"[OK] Sistemato e normalizzato: {p.name}")

def main():
    if not MESSAGES.exists():
        print(f"[ERR] Cartella non trovata: {MESSAGES}")
        sys.exit(1)
    for p in TARGETS:
        process(p)
    print("[DONE] Auto-fix completato.")

if __name__ == "__main__":
    main()
