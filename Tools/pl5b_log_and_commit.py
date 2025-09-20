# tools/pl5b_log_and_commit.py
# -*- coding: utf-8 -*-
from pathlib import Path
import datetime as dt
import subprocess

ROOT = Path(__file__).resolve().parents[1]
WORKLOG = ROOT / "worklog.md"

# <<< CAMBIA QUI LA DURATA SE VUOI >>>
DURATION = "40m"
TITLE = "PL-5b – Integrazione Header/Footer"
BULLETS = [
    "Integrati SiteHeader e SiteFooter nel layout.tsx",
    "Aggiustati import e percorso componenti",
]

FILES = [
    "webapp/app/[locale]/layout.tsx",
    "webapp/components/SiteHeader.tsx",
    "webapp/components/SiteFooter.tsx",
    "webapp/next.config.mjs",
    "webapp/app/[locale]/blog/[slug]/page.tsx",
    "worklog.md",
]

def run(cmd): return subprocess.call(cmd, cwd=ROOT)

def append_worklog():
    if not WORKLOG.exists():
        WORKLOG.write_text("# Worklog – ICA Next.js + Supabase\n\n", encoding="utf-8", newline="\n")
    today = dt.date.today().isoformat()
    lines = [
        f"### 📌 {today} – {TITLE}",
        *[f"- {b}" for b in BULLETS],
        f"⏱ {DURATION}",
        "",
    ]
    with WORKLOG.open("a", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines))

def main():
    append_worklog()
    run(["git", "add", *FILES])
    msg = f"{TITLE} – ⏱ {DURATION}"
    run(["git", "commit", "-m", msg])
    run(["git", "push", "origin", "main"])
    print("[DONE] PL-5b chiusa, commit e push effettuati.")

if __name__ == "__main__":
    main()
