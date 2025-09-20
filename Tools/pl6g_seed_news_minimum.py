# -*- coding: utf-8 -*-
"""
pl6g_seed_news_minimum.py
Semina news minime per il pre-lancio tramite Supabase REST.
- Inserisce 2 news IT e 2 news EN (solo se mancanti).
- Campi usati: slug, title, summary, body, lang (nessuna dipendenza da created_at).
- Legge SUPABASE URL e SERVICE ROLE da webapp/.env.local o env di sistema.

Exit codes: 0 OK, 2 errore I/O/HTTP.
"""
from __future__ import annotations
from pathlib import Path
import os, json, urllib.request, urllib.error

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
ENV_FILE = WEBAPP / ".env.local"

def load_env() -> dict:
    env = dict(os.environ)
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env.setdefault(k.strip(), v.strip())
    return env

def supabase_headers(anon_or_service_key: str) -> dict:
    return {
        "apikey": anon_or_service_key,
        "Authorization": f"Bearer {anon_or_service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

def rest_get(url: str, headers: dict) -> list:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        return json.loads(data.decode("utf-8"))

def rest_insert(url: str, headers: dict, rows: list[dict]) -> list:
    body = json.dumps(rows).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        return json.loads(data.decode("utf-8"))

def main() -> int:
    env = load_env()
    base = env.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("ADMIN_TOKEN") or ""

    if not base or not service_key:
        print("[ERROR] Variabili mancanti. Richiesti:")
        print(" - NEXT_PUBLIC_SUPABASE_URL")
        print(" - SUPABASE_SERVICE_ROLE_KEY (o ADMIN_TOKEN)")
        return 2

    headers = supabase_headers(service_key)
    table_url = f"{base}/rest/v1/news"

    # dataset: 2 IT + 2 EN
    seeds = [
        {
            "slug": "annuncio-prelancio",
            "title": "Annuncio pre-lancio del sito ICA",
            "summary": "È online l’anteprima del nostro sito: news, guide, missione.",
            "body": "Stiamo preparando i contenuti principali. In questa fase raccogliamo feedback.",
            "lang": "it",
        },
        {
            "slug": "evento-community",
            "title": "Primo incontro della community",
            "summary": "Un incontro informale per presentarci e ascoltare i vostri suggerimenti.",
            "body": "Agenda: presentazione breve, domande, roadmap iniziative. Partecipazione gratuita.",
            "lang": "it",
        },
        {
            "slug": "prelaunch-announcement",
            "title": "ICA website pre-launch announcement",
            "summary": "Preview is live: news, guides and our mission statement.",
            "body": "We’re polishing the core content. Early feedback is welcome.",
            "lang": "en",
        },
        {
            "slug": "community-meetup",
            "title": "First community meetup",
            "summary": "An informal meetup to introduce the project and collect suggestions.",
            "body": "Agenda: short intro, Q&A, roadmap. Free participation.",
            "lang": "en",
        },
    ]

    created = []
    skipped = []

    for row in seeds:
        slug, lang = row["slug"], row["lang"]
        # verifica se esiste già
        q = f"{table_url}?select=slug,lang&slug=eq.{urllib.parse.quote(slug)}&lang=eq.{urllib.parse.quote(lang)}"
        try:
            found = rest_get(q, headers)
        except urllib.error.HTTPError as e:
            print(f"[ERROR] GET {slug}/{lang}: {e.code} {e.reason}")
            return 2

        if found:
            skipped.append(f"{lang}:{slug}")
            continue

        try:
            resp = rest_insert(table_url, headers, [row])
            if resp:
                created.append(f"{lang}:{slug}")
            else:
                print(f"[WARN] Inserimento vuoto per {lang}:{slug}")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", errors="ignore")
            print(f"[ERROR] INSERT {lang}:{slug}: {e.code} {e.reason} -> {msg}")
            return 2

    print("=== pl6g_seed_news_minimum ===")
    print(f"CREATED: {', '.join(created) if created else 'none'}")
    print(f"SKIPPED (già presenti): {', '.join(skipped) if skipped else 'none'}")
    print("DONE.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
