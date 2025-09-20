# -*- coding: utf-8 -*-
"""
env_set.py
Aggiorna/aggiunge in modo idempotente una variabile in webapp/.env.local.

Uso:
  .\.venv\Scripts\python.exe tools\env_set.py NOME_VARIABILE VALORE

Esempio:
  .\.venv\Scripts\python.exe tools\env_set.py NEXT_PUBLIC_NEWSLETTER_ACTION https://formspree.io/f/xxxxxxx

Exit codes: 0=OK, 1=usage error, 2=I/O error
"""
from __future__ import annotations
import sys
from pathlib import Path

def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python tools/env_set.py KEY VALUE")
        return 1

    key = sys.argv[1].strip()
    value = " ".join(sys.argv[2:]).strip()

    root = Path(".").resolve()
    env_path = root / "webapp" / ".env.local"
    env_path.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    if env_path.exists():
        try:
            lines = env_path.read_text(encoding="utf-8").splitlines()
        except Exception as e:
            print(f"[ERROR] Lettura {env_path}: {e}")
            return 2

    updated = False
    out_lines: list[str] = []
    seen = False

    for line in lines:
        if not line.strip() or line.strip().startswith("#") or "=" not in line:
            out_lines.append(line)
            continue
        k, v = line.split("=", 1)
        if k.strip() == key:
            out_lines.append(f"{key}={value}")
            updated = True
            seen = True
        else:
            out_lines.append(line)

    if not seen:
        out_lines.append(f"{key}={value}")
        updated = True

    try:
        env_path.write_text("\n".join(out_lines).rstrip() + "\n", encoding="utf-8")
    except Exception as e:
        print(f"[ERROR] Scrittura {env_path}: {e}")
        return 2

    action = "UPDATED" if seen else "ADDED"
    print(f"[{action}] {env_path} -> {key}={value}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
