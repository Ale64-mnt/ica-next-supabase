# tools/preflight.py
from __future__ import annotations
import os, sys, json, re, urllib.request, urllib.error, ssl
from pathlib import Path
from typing import Tuple, List, Dict
from base64 import b64encode

ROOT = Path(__file__).resolve().parents[1]    # repo root
WEBAPP = ROOT / "webapp"

REQUIRED_ENV = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]

CRITICAL_FILES = [
    WEBAPP / "app" / "[locale]" / "layout.tsx",
    WEBAPP / "app" / "[locale]" / "page.tsx",
    WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx",
    WEBAPP / "components" / "SiteHeader.tsx",
    WEBAPP / "components" / "SiteFooter.tsx",
    WEBAPP / "public" / "logo.png",
]

I18N_FILES = [
    WEBAPP / "messages" / "it.json",
    WEBAPP / "messages" / "en.json",
]

def ok(msg):   print(f"[OK]  {msg}")
def warn(msg): print(f"[WARN]{msg}")
def err(msg):  print(f"[ERR] {msg}")

def read_env_local(path: Path) -> Dict[str, str]:
    if not path.exists():
        err(f".env.local non trovato: {path}")
        return {}
    out = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out

def validate_env(env: Dict[str,str]) -> Tuple[bool, str]:
    missing = [k for k in REQUIRED_ENV if not env.get(k)]
    if missing:
        return False, f"Mancano variabili: {', '.join(missing)}"
    url = env["NEXT_PUBLIC_SUPABASE_URL"]
    if not re.match(r"^https://[a-z0-9\-]+\.supabase\.co/?$", url):
        return False, f"URL Supabase sospetto: {url}"
    if len(env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) < 20:
        return False, "Anon key troppo corta"
    return True, "Env ok"

def http_get(url: str, headers: Dict[str,str], timeout=6) -> Tuple[int, bytes]:
    req = urllib.request.Request(url, headers=headers)
    ctx = ssl.create_default_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return r.getcode(), r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read() if e.fp else b""
    except Exception:
        return 0, b""

def check_supabase(env: Dict[str,str]) -> Tuple[bool,str,List[str]]:
    url  = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    key  = env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    hdrs = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
    }
    # semplice ping REST
    code,_ = http_get(f"{url}/rest/v1/", hdrs)
    if code in (200, 401, 404):  # 401/404 è ok: endpoint esiste
        ok("Connessione Supabase REST raggiungibile")
    else:
        return False, f"Impossibile raggiungere REST (code={code})", []

    # Leggo gli slug per cercare duplicati (serve SELECT pubblica sulla tabella news)
    code, body = http_get(f"{url}/rest/v1/news?select=slug", hdrs)
    if code not in (200, 206):
        return False, f"SELECT news fallita (code={code}). RLS/permessi?", []
    try:
        rows = json.loads(body.decode("utf-8"))
    except Exception:
        return False, "Risposta REST non JSON", []
    slugs = [r.get("slug","") for r in rows if isinstance(r, dict)]
    dups = sorted({s for s in slugs if s and slugs.count(s) > 1})
    return True, "SELECT ok", dups

def check_files():
    all_ok = True
    for p in CRITICAL_FILES:
        if p.exists():
            ok(f"File presente: {p.relative_to(ROOT)}")
        else:
            err(f"File mancante: {p.relative_to(ROOT)}"); all_ok = False
    return all_ok

def check_i18n():
    all_ok = True
    for p in I18N_FILES:
        try:
            json.loads(p.read_text(encoding="utf-8-sig"))
            ok(f"JSON valido: {p.relative_to(ROOT)}")
        except Exception as e:
            err(f"JSON non valido: {p.relative_to(ROOT)} – {e}"); all_ok=False
    return all_ok

def check_next_config():
    path = WEBAPP / "next.config.mjs"
    if not path.exists():
        warn("next.config.mjs non trovato (ok se non usi next/image esterni)")
        return True
    s = path.read_text(encoding="utf-8", errors="ignore")
    if "placehold.co" in s or "remotePatterns" in s or "images:" in s:
        ok("next.config.mjs: configurazione immagini esterne presente")
        return True
    warn("next.config.mjs: non vedo host immagini esterni (es. placehold.co)")
    return True

def main():
    print(f"[START] Preflight in: {ROOT}")
    if not WEBAPP.exists():
        err(f"Cartella webapp non trovata: {WEBAPP}"); sys.exit(2)

    env = read_env_local(WEBAPP/".env.local")
    ok_env, msg = validate_env(env)
    if ok_env: ok(msg)
    else: err(msg)

    files_ok = check_files()
    i18n_ok  = check_i18n()
    cfg_ok   = check_next_config()

    supa_ok, supa_msg, dups = (False,"skip (env KO)",[])
    if ok_env:
        supa_ok, supa_msg, dups = check_supabase(env)
        if supa_ok: ok(supa_msg)
        else: err(supa_msg)

    if dups:
        err(f"Slug duplicati in news: {', '.join(dups)}")
        print("Suggerimento: rinomina/normalizza gli slug o applica il fix SQL proposto.")

    all_green = ok_env and files_ok and i18n_ok and cfg_ok and supa_ok and not dups
    print("\n===== RISULTATO =====")
    if all_green:
        print("✅ Preflight VERDE: puoi procedere.")
        sys.exit(0)
    else:
        print("❌ Preflight ROSSO: vedi messaggi sopra.")
        sys.exit(1)

if __name__ == "__main__":
    main()
