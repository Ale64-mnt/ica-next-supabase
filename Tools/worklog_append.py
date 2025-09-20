# -*- coding: utf-8 -*-
"""
worklog_append.py
- Legge l'ultimo commit git
- Estrae fase (PL-6b), descrizione e tempo (es: 1h 20m o 30m)
- Aggiunge in worklog.md nella sezione corretta
- NON duplica se la voce esiste già
"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORKLOG = ROOT / "worklog.md"

def get_last_commit() -> str:
    return subprocess.check_output(
        ["git", "log", "-1", "--pretty=%s"], cwd=ROOT, text=True
    ).strip()

def parse_commit(msg: str):
    m = re.match(r"(PL-\d+\w*): (.+?) – tempo registrato (.+)", msg)
    if not m:
        raise ValueError(f"Commit message non valido: {msg}")
    phase, desc, duration = m.groups()
    return phase, desc.strip(), duration.strip()

def append_worklog(phase: str, desc: str, duration: str):
    lines = WORKLOG.read_text(encoding="utf-8").splitlines()
    header = f"### 📌 {phase}"

    # Se esiste già, non duplicare
    joined = "\n".join(lines)
    if desc in joined and duration in joined:
        print(f"[SKIP] {phase}: già registrato")
        return False

    # Sezione fase non trovata → aggiungila in fondo
    if header not in lines:
        lines.append("")
        lines.append(header)

    # Aggiungi voce
    lines.append(f"- {desc}")
    lines.append(f"⏱ {duration}")

    WORKLOG.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[APPEND] {phase}: {desc} ({duration})")
    return True

def main():
    msg = get_last_commit()
    print(f"[COMMIT] {msg}")
    try:
        phase, desc, duration = parse_commit(msg)
    except ValueError as e:
        print(f"[WARN] {e}")
        return 1
    append_worklog(phase, desc, duration)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
