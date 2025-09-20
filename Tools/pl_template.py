
# tools/pl_template.py
# -*- coding: utf-8 -*-
"""
Template standard per fasi PL-* con TIMER integrato.
- --start        : avvia il timer
- --status       : mostra tempo trascorso
- --cancel       : annulla timer
- --apply        : scrive/aggiorna file + worklog
- --use-timer    : calcola durata dal timer e sovrascrive CONFIG.duration
- --git          : esegue git add/commit automatico
- --dry-run      : anteprima senza modifiche

USO TIPICO:
  1) .\.venv\Scripts\python.exe tools\pl_template.py --start
  2) ...lavori...
  3) .\.venv\Scripts\python.exe tools\pl_template.py --apply --use-timer --git
"""

from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
import argparse
import datetime as dt
import json
import subprocess
import sys
import textwrap

# ========================= CONFIG FASE (personalizza qui) ===================

@dataclass
class FileOp:
    path: str
    content: str
    mode: str = "w"        # "w" = riscrivi, "a" = append
    ensure_dir: bool = True

@dataclass
class Config:
    date: str
    title: str
    bullets: list[str]
    duration: str                 # es. "45m", "1h 20m" (verrà sovrascritto se --use-timer)
    git_message: str
    files: list[FileOp]
    json_patterns: list[str] = field(default_factory=lambda: ["webapp/messages/*.json"])
    worklog_path: str = "worklog.md"

ROOT = Path(__file__).resolve().parents[1]
TIMER_FILE = ROOT / ".pl_timer.json"

# === ESEMPlO: PL-5 Header & Footer (puoi cambiare titolo/bullets/file) ======
EDITORIAL_CSS = r"""
/* === PL-5 header/footer basics (Tailwind v4-safe) === */
:root { --header-h: 64px; }
@media (min-width: 768px){ :root { --header-h: 80px; } }
.body-with-sticky-header { padding-top: var(--header-h); }
.site-footer { color: #6b7280; border-top: 1px solid #e5e7eb; }
"""

SITE_HEADER = textwrap.dedent("""\
'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)?.[0] ?? "";
  return (
    <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <button aria-label="Search" className="p-2 rounded hover:bg-gray-100"><IconSearch /></button>
          <Link href={`/${locale || ""}`} className="inline-flex items-center">
            <span className="sr-only">Home</span>
            <Image src="/logo-edunova.png" alt="Edunovà" width={200} height={48} className="h-8 md:h-10 w-auto" priority />
          </Link>
          <button aria-label="Menu" className="p-2 rounded hover:bg-gray-100"><IconMenu /></button>
        </div>
      </div>
    </div>
  );
}
""")

SITE_FOOTER = textwrap.dedent("""\
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <nav className="flex gap-5 text-sm">
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/contatti" className="hover:underline">Contatti</a>
            <a href="/about" className="hover:underline">Chi siamo</a>
          </nav>
          <p className="text-sm">&copy; {new Date().getFullYear()} Edunovà – Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
""")

CONFIG = Config(
    date=dt.date.today().isoformat(),
    title="PL-5 – Header & Footer (componenti + CSS base)",
    bullets=[
        "Creati componenti `SiteHeader.tsx` e `SiteFooter.tsx`",
        "Append in `globals.css` per header sticky v4-safe",
        "Integrazione a layout prevista nello step PL-5b"
    ],
    duration="0m",  # verrà sovrascritto se usi --use-timer
    git_message="PL-5: Header & Footer – componenti e CSS base",
    files=[
        FileOp(path="webapp/components/SiteHeader.tsx", content=SITE_HEADER),
        FileOp(path="webapp/components/SiteFooter.tsx", content=SITE_FOOTER),
        FileOp(path="webapp/app/globals.css", content=EDITORIAL_CSS, mode="a"),
    ],
    json_patterns=["webapp/messages/*.json"],
    worklog_path="worklog.md",
)

# =============================== UTIL ======================================

def glob_many(patterns: list[str]) -> list[Path]:
    out: list[Path] = []
    for pat in patterns:
        out.extend(ROOT.glob(pat))
    seen: set[Path] = set()
    uniq: list[Path] = []
    for p in out:
        if p not in seen:
            uniq.append(p); seen.add(p)
    return uniq

def write_file(op: FileOp, *, dry: bool=False) -> None:
    path = ROOT / op.path
    if op.ensure_dir:
        path.parent.mkdir(parents=True, exist_ok=True)
    action = "APPEND" if op.mode == "a" and path.exists() else "WRITE"
    if dry:
        print(f"[DRY] {action}: {path}")
        return
    if op.mode == "a" and path.exists():
        with path.open("a", encoding="utf-8", newline="\n") as f:
            f.write(op.content)
    else:
        path.write_text(op.content, encoding="utf-8", newline="\n")
    print(f"[OK]  {action}: {path.relative_to(ROOT)}")

def validate_json(patterns: list[str]) -> None:
    errs = []
    for f in glob_many(patterns):
        try:
            json.loads(f.read_text(encoding="utf-8-sig"))
            print(f"[JSON] OK  {f.relative_to(ROOT)}")
        except json.JSONDecodeError as e:
            print(f"[JSON] ERR {f.relative_to(ROOT)} line {e.lineno} col {e.colno}: {e.msg}")
            errs.append(f)
    if errs:
        raise SystemExit("[ABORT] JSON non valido. Correggi e riprova.")

def update_worklog(cfg: Config, *, dry: bool=False) -> None:
    wl = ROOT / cfg.worklog_path
    lines = [
        f"### 📌 {cfg.date} – {cfg.title}",
        *[f"- {b}" for b in cfg.bullets],
        f"⏱ {cfg.duration}",
    ]
    entry = "\n".join(lines) + "\n"
    if dry:
        print("[DRY] worklog append:\n" + entry); return
    if not wl.exists():
        wl.write_text("# Worklog – ICA Next.js + Supabase\n", encoding="utf-8", newline="\n")
    with wl.open("a", encoding="utf-8", newline="\n") as f:
        f.write("\n" + entry)
    print(f"[OK]  worklog aggiornato: {wl.relative_to(ROOT)}")

def run(cmd: list[str]) -> int:
    print(f"[CMD] {' '.join(cmd)}")
    return subprocess.call(cmd, cwd=ROOT)

def git_commit(cfg: Config, paths: list[str]) -> None:
    run(["git", "add"] + paths)
    code = run(["git", "commit", "-m", cfg.git_message])
    if code == 0: print("[GIT] commit creato.")
    else: print("[GIT] nessuna modifica (o errore).")

# =============================== TIMER =====================================

def timer_start() -> None:
    if TIMER_FILE.exists():
        print("[TIMER] già avviato. Usa --status o --cancel.")
        return
    payload = {"started_at": dt.datetime.now().isoformat(timespec="seconds")}
    TIMER_FILE.write_text(json.dumps(payload), encoding="utf-8")
    print(f"[TIMER] avviato alle {payload['started_at']}")

def timer_status() -> None:
    if not TIMER_FILE.exists():
        print("[TIMER] non attivo."); return
    started = json.loads(TIMER_FILE.read_text(encoding="utf-8"))["started_at"]
    start_dt = dt.datetime.fromisoformat(started)
    delta = dt.datetime.now() - start_dt
    print(f"[TIMER] attivo da {format_delta(delta)} (start {started})")

def timer_cancel() -> None:
    if TIMER_FILE.exists():
        TIMER_FILE.unlink()
        print("[TIMER] annullato.")
    else:
        print("[TIMER] non attivo.")

def timer_use_to_duration() -> str:
    """Ritorna durata formattata tipo '1h 25m' e chiude il timer."""
    if not TIMER_FILE.exists():
        raise SystemExit("[TIMER] non attivo: avvia con --start oppure non usare --use-timer.")
    started = json.loads(TIMER_FILE.read_text(encoding="utf-8"))["started_at"]
    start_dt = dt.datetime.fromisoformat(started)
    delta = dt.datetime.now() - start_dt
    TIMER_FILE.unlink(missing_ok=True)
    return format_delta(delta)

def format_delta(delta: dt.timedelta) -> str:
    mins = int(delta.total_seconds() // 60)
    h, m = divmod(mins, 60)
    if h and m: return f"{h}h {m}m"
    if h: return f"{h}h"
    return f"{m}m"

# =============================== MAIN ======================================

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", action="store_true", help="Avvia timer")
    ap.add_argument("--status", action="store_true", help="Stato timer")
    ap.add_argument("--cancel", action="store_true", help="Annulla timer")
    ap.add_argument("--apply", action="store_true", help="Scrive file + worklog")
    ap.add_argument("--use-timer", action="store_true", help="Usa timer per duration (e chiude timer)")
    ap.add_argument("--git", action="store_true", help="Git add/commit")
    ap.add_argument("--dry-run", action="store_true", help="Anteprima")
    args = ap.parse_args()

    if args.start:  timer_start();  return
    if args.status: timer_status(); return
    if args.cancel: timer_cancel(); return

    cfg = CONFIG
    print(f"[INFO] ROOT: {ROOT}")
    print(f"[INFO] Fase: {cfg.title}")

    if args.use_timer:
        cfg.duration = timer_use_to_duration()
        print(f"[INFO] Durata da timer: {cfg.duration}")
    else:
        print(f"[INFO] Durata da config: {cfg.duration}")

    touched = []
    for op in cfg.files:
        write_file(op, dry=args.dry_run)
        touched.append(op.path)

    if not args.dry_run:
        validate_json(cfg.json_patterns)

    update_worklog(cfg, dry=args.dry_run)

    if not args.apply and not args.dry_run:
        print("[NOTE] Usa --apply per rendere effettive le modifiche.")
        return

    if args.git and not args.dry_run:
        if cfg.worklog_path not in touched:
            touched.append(cfg.worklog_path)
        git_commit(cfg, touched)

    print("[DONE] Fase completata.")

if __name__ == "__main__":
    main()
