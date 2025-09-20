# -*- coding: utf-8 -*-
"""
verify_stack_readiness.py
Verifica NON-distruttiva dello stato progetto (Next.js + next-intl + Tailwind + Supabase)
- Controlla presenza file e cartelle chiave
- Legge contenuti minimi (env, i18n JSON, layout, config)
- Emette riepilogo a video e salva report JSON in reports/verify_stack_readiness.json

Esecuzione:
  .\.venv\Scripts\python.exe tools\verify_stack_readiness.py --tree
Opzioni:
  --root "C:\\Users\\Alessandro\\ica-Next.js + Supabase"
  --no-env    -> salta lettura .env.local
  --tree      -> stampa albero directory essenziali
Exit codes: 0=OK, 1=WARNING, 2=ERROR
"""
from __future__ import annotations
import argparse
import json
import os
import re
from pathlib import Path
from datetime import datetime

ROOT_DEFAULT = Path(".").resolve()
WEBAPP = Path("webapp")

LOCALES = ["it", "en"]  # target pre-lancio
REQUIRED_ENV = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]
OPTIONAL_ENV = [
    "ADMIN_TOKEN",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_GA_ID",
    "NEXT_PUBLIC_NEWSLETTER_ACTION",
]

REQUIRED_FILES = [
    WEBAPP / "app" / "[locale]" / "layout.tsx",
    WEBAPP / "app" / "[locale]" / "page.tsx",
    WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx",
    WEBAPP / "components" / "SiteHeader.tsx",
    WEBAPP / "components" / "SiteFooter.tsx",
    WEBAPP / "messages" / "it.json",
    WEBAPP / "messages" / "en.json",
    WEBAPP / "app" / "globals.css",
    Path("tools") / "preflight.py",
    Path("tools") / "pl5b_verify_phase.py",
    WEBAPP / "public" / "logo.png",
]
# SEO pre-lancio target (verranno WARN se mancanti)
RECOMMENDED_FILES = [
    WEBAPP / "app" / "sitemap.ts",
    WEBAPP / "app" / "robots.ts",
    WEBAPP / "components" / "Analytics.tsx",
    WEBAPP / "components" / "CookieBanner.tsx",
    WEBAPP / "app" / "it" / "privacy" / "page.tsx",
    WEBAPP / "app" / "en" / "privacy" / "page.tsx",
    WEBAPP / "app" / "it" / "newsletter" / "page.tsx",
    WEBAPP / "app" / "en" / "newsletter" / "page.tsx",
]

def read_text_safe(p: Path) -> str | None:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        return None

def is_json_valid(p: Path) -> bool:
    try:
        json.loads(p.read_text(encoding="utf-8"))
        return True
    except Exception:
        return False

def detect_import_alias_in_ts(text: str) -> bool:
    # euristica: presenza di import da "@/..."
    return bool(re.search(r'''from\s+['"]@/''', text))

def find_in_layout_for_components(text: str) -> dict:
    present = {
        "NextIntlClientProvider": "NextIntlClientProvider" in text,
        "Analytics": "Analytics" in text,
        "CookieBanner": "CookieBanner" in text,
        "SiteHeader": "SiteHeader" in text,
        "SiteFooter": "SiteFooter" in text,
        "main_wrapper": bool(re.search(r"<main[^>]*>", text)),
    }
    return present

def parse_env_lines(text: str) -> dict:
    env = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"): 
            continue
        if "=" in line:
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip()
    return env

def print_tree(root: Path, rels: list[Path], max_depth: int = 4) -> None:
    seen_roots = { (root / p).parts[:3] for p in rels }  # prime 3 parti per selezionare macrocartelle
    interesting = set()
    for p in rels:
        interesting.add(root / p if p.is_absolute() else (root / p))
    extra_dirs = [
        WEBAPP / "app",
        WEBAPP / "components",
        WEBAPP / "messages",
        WEBAPP / "public",
        Path("tools"),
    ]
    for d in extra_dirs:
        interesting.add(root / d)

    def walk(d: Path, depth: int = 0):
        if depth > max_depth: 
            return
        if not d.exists(): 
            return
        indent = "  " * depth
        try:
            entries = sorted(d.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        except PermissionError:
            print(f"{indent}[DENY] {d.name}")
            return
        print(f"{indent}{d.name}/")
        for e in entries:
            if e.is_dir():
                # visita solo directory rilevanti (per contenere file attesi)
                if any(str(e).startswith(str((root / p).parent)) for p in rels) or str(e).startswith(str(root / WEBAPP)):
                    walk(e, depth + 1)
            else:
                print(f"{indent}  {e.name}")

    for base in sorted({(root / WEBAPP), (root / "tools"), (root / "reports")}):
        walk(base, 0)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", type=str, default=str(ROOT_DEFAULT), help="Root repo")
    ap.add_argument("--no-env", action="store_true", help="Salta lettura .env.local")
    ap.add_argument("--tree", action="store_true", help="Stampa albero essenziale")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    os.chdir(root)

    result = {
        "root": str(root),
        "timestamp": datetime.now().isoformat(),
        "checks": {
            "files_required": [],
            "files_recommended": [],
            "env": {},
            "messages_json": {},
            "layout_locale": {},
            "next_config": {},
            "aliases": {},
        },
        "summary": {"ok": 0, "warn": 0, "err": 0},
    }

    print(f"[START] Verifica stack in: {root}")

    # 1) File richiesti
    for p in REQUIRED_FILES:
        abs_p = (root / p)
        if abs_p.exists():
            print(f"[OK]  {p}")
            result["checks"]["files_required"].append({"path": str(p), "status": "OK"})
            result["summary"]["ok"] += 1
        else:
            print(f"[ERR] {p} (mancante)")
            result["checks"]["files_required"].append({"path": str(p), "status": "ERR"})
            result["summary"]["err"] += 1

    # 2) File raccomandati (SEO/Privacy/Newsletter/Analytics/Cookie)
    for p in RECOMMENDED_FILES:
        abs_p = (root / p)
        if abs_p.exists():
            print(f"[OK]  {p}")
            result["checks"]["files_recommended"].append({"path": str(p), "status": "OK"})
            result["summary"]["ok"] += 1
        else:
            print(f"[WRN] {p} (consigliato)")
            result["checks"]["files_recommended"].append({"path": str(p), "status": "WARN"})
            result["summary"]["warn"] += 1

    # 3) Env
    env_path = root / WEBAPP / ".env.local"
    env_read = {}
    if not args.no_env:
        if env_path.exists():
            text = read_text_safe(env_path) or ""
            env_read = parse_env_lines(text)
            missing = [k for k in REQUIRED_ENV if k not in env_read or not env_read[k]]
            for k in REQUIRED_ENV:
                status = "OK" if k in env_read and env_read[k] else "ERR"
                print(f"[{'OK' if status=='OK' else 'ERR'}] env {k}")
                result["summary"]["ok" if status=="OK" else "err"] += 1
            for k in OPTIONAL_ENV:
                status = "OK" if k in env_read and env_read[k] else "WARN"
                print(f"[{'OK' if status=='OK' else 'WRN'}] env {k} {'(opz.)' if status!='OK' else ''}")
                result["summary"]["ok" if status=="OK" else "warn"] += 1
        else:
            print(f"[ERR] {env_path.relative_to(root)} non trovato")
            result["summary"]["err"] += 1
    result["checks"]["env"] = env_read

    # 4) i18n JSON
    for lang in LOCALES:
        p = root / WEBAPP / "messages" / f"{lang}.json"
        if p.exists():
            ok = is_json_valid(p)
            print(f"[{'OK' if ok else 'ERR'}] messages/{lang}.json JSON")
            result["checks"]["messages_json"][lang] = "OK" if ok else "ERR"
            result["summary"]["ok" if ok else "err"] += 1
        else:
            print(f"[ERR] messages/{lang}.json mancante")
            result["checks"]["messages_json"][lang] = "ERR"
            result["summary"]["err"] += 1

    # 5) Layout locale – controlli basilari
    layout = root / WEBAPP / "app" / "[locale]" / "layout.tsx"
    layout_txt = read_text_safe(layout) or ""
    lc = find_in_layout_for_components(layout_txt) if layout_txt else {}
    for k, v in lc.items():
        print(f"[{'OK' if v else 'WRN'}] layout: {k}")
        result["summary"]["ok" if v else "warn"] += 1
    result["checks"]["layout_locale"] = lc

    # 6) next.config.mjs – images.remotePatterns presente?
    next_cfg = root / WEBAPP / "next.config.mjs"
    cfg_txt = read_text_safe(next_cfg) or ""
    has_images = "images:" in cfg_txt and "remotePatterns" in cfg_txt
    print(f"[{'OK' if has_images else 'WRN'}] next.config.mjs immagini remotePatterns")
    result["summary"]["ok" if has_images else "warn"] += 1
    result["checks"]["next_config"]["images_remotePatterns"] = bool(has_images)

    # 7) Alias import "@/"
    alias_detected = False
    ts_files_checked = 0
    for p in (root / WEBAPP).rglob("*.tsx"):
        ts_files_checked += 1
        txt = read_text_safe(p) or ""
        if txt and detect_import_alias_in_ts(txt):
            alias_detected = True
            break
    print(f"[{'OK' if alias_detected else 'WRN'}] alias '@/components' rilevato (scan {ts_files_checked} file)")
    result["summary"]["ok" if alias_detected else "warn"] += 1
    result["checks"]["aliases"]["at_alias_detected"] = alias_detected

    # 8) Sitemap/robots sintassi rapida (se presenti)
    def quick_ts_export_default_ok(path: Path) -> bool:
        txt = read_text_safe(path) or ""
        return "export default" in txt

    for p in [WEBAPP / "app" / "sitemap.ts", WEBAPP / "app" / "robots.ts"]:
        abs_p = root / p
        if abs_p.exists():
            ok = quick_ts_export_default_ok(abs_p)
            print(f"[{'OK' if ok else 'ERR'}] {p} export default")
            result["summary"]["ok" if ok else "err"] += 1

    # Report
    reports_dir = root / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    out = reports_dir / "verify_stack_readiness.json"
    out.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n[REPORT] {out}")

    # Esito complessivo
    code = 0
    if result["summary"]["err"] > 0:
        code = 2
    elif result["summary"]["warn"] > 0:
        code = 1

    # Albero opzionale
    if args.tree:
        print("\n[DIR TREE] essenziale:")
        try:
            print_tree(root, REQUIRED_FILES + RECOMMENDED_FILES, max_depth=6)
        except Exception as e:
            print(f"[WRN] tree: {e}")

    status = {0: "OK", 1: "WARNING", 2: "ERROR"}[code]
    print(f"\n[END] Status: {status} | OK:{result['summary']['ok']} WARN:{result['summary']['warn']} ERR:{result['summary']['err']}")
    raise SystemExit(code)

if __name__ == "__main__":
    main()
