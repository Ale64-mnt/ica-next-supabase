# tools/pl2_news_setup.py
# -*- coding: utf-8 -*-
"""
PL-2 (News pubblico) – setup automatico:
1) Normalizza i JSON i18n (tollera BOM, commenti // e /* */, virgole finali)
2) Aggiunge/merge 'news' in messages/it.json e messages/en.json (backup .bak-YYYYMMDD-HHMMSS)
3) Crea/aggiorna app/[locale]/news/[slug]/page.tsx (dettaglio pubblico)
"""

from __future__ import annotations
import json
import re
import sys
from pathlib import Path
from datetime import datetime

# --- Percorsi ---
REPO = Path(__file__).resolve().parents[1]
WEBAPP = REPO / "webapp"
MESSAGES_DIR = WEBAPP / "messages"
DETAIL_PATH = WEBAPP / "app" / "[locale]" / "news" / "[slug]" / "page.tsx"

# --- Locali target per news ---
LOCALES = ["it", "en"]

NEWS_I18N = {
    "it": {
        "title": "News",
        "intro": "Ultime notizie di educazione finanziaria e digitale.",
        "empty": "Nessuna notizia disponibile.",
        "readMore": "Leggi di più"
    },
    "en": {
        "title": "News",
        "intro": "Latest updates on financial and digital education.",
        "empty": "No news available.",
        "readMore": "Read more"
    }
}

DETAIL_CODE = (
    'import { getSupabasePublicServer } from "@/lib/supabaseServerPublic";\n'
    'import { notFound } from "next/navigation";\n'
    '\n'
    'export const dynamic = "force-dynamic";\n'
    '\n'
    'export default async function NewsDetail({ params }: { params: { locale: string; slug: string } }) {\n'
    '  const supa = getSupabasePublicServer();\n'
    '  const { data, error } = await supa\n'
    '    .from("news")\n'
    '    .select("id,title,body,source_url,cover_url,slug,published_at")\n'
    '    .eq("slug", params.slug)\n'
    '    .single();\n'
    '\n'
    '  if (error || !data) return notFound();\n'
    '\n'
    '  return (\n'
    '    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">\n'
    '      <header>\n'
    '        <h1 className="text-3xl font-bold">{data.title}</h1>\n'
    '        <p className="text-sm text-gray-500">\n'
    '          {data.published_at ? new Date(data.published_at).toLocaleString(params.locale) : "—"}\n'
    '        </p>\n'
    '      </header>\n'
    '\n'
    '      {data.cover_url && (\n'
    '        <img src={data.cover_url} alt="" className="w-full max-h-[420px] object-cover rounded-lg" />\n'
    '      )}\n'
    '\n'
    '      <article className="prose prose-neutral max-w-none">{data.body}</article>\n'
    '\n'
    '      {data.source_url && (\n'
    '        <p className="text-sm text-gray-600">\n'
    '          Fonte: <a href={data.source_url} className="underline text-blue-600" target="_blank">{data.source_url}</a>\n'
    '        </p>\n'
    '      )}\n'
    '    </main>\n'
    '  );\n'
    '}\n'
)

# --- Utility JSON tollerante ---
RE_LINE_COMMENTS = re.compile(r'(^|[^:])//.*?$', re.MULTILINE)
RE_BLOCK_COMMENTS = re.compile(r'/\*.*?\*/', re.DOTALL)
RE_TRAIL_COMMA_OBJ = re.compile(r',\s*}', re.MULTILINE)
RE_TRAIL_COMMA_ARR = re.compile(r',\s*]', re.MULTILINE)

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

def tolerant_load(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8-sig")
    cleaned = _fix_trailing_commas(_rm_comments(_strip_bom(raw)))
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        _show_json_err(path, cleaned, e)
        raise

def _show_json_err(path: Path, text: str, err: json.JSONDecodeError) -> None:
    lines = text.splitlines()
    ln = max(1, err.lineno or 1)
    start = max(1, ln - 5)
    end = min(len(lines), ln + 5)
    print(f"\n[ERR] JSON non valido: {path}")
    print(f"      {err.msg} (line {err.lineno}, col {err.colno})")
    print("------ contesto ------")
    for i in range(start, end + 1):
        mark = ">>" if i == ln else "  "
        print(f"{mark} {i:04d}: {lines[i-1]}")
    print("----------------------\n")

# --- IO helpers ---
def _now_tag() -> str:
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def backup(path: Path) -> Path:
    b = path.with_suffix(path.suffix + f".bak-{_now_tag()}")
    b.write_bytes(path.read_bytes())
    return b

def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
        f.write("\n")

def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8", newline="\n")

# --- Operazioni ---
def normalize_and_merge_i18n() -> None:
    errors = []
    for loc in LOCALES:
        p = MESSAGES_DIR / f"{loc}.json"
        if not p.exists():
            # crea nuovo file di lingua con solo news
            write_json(p, {"news": NEWS_I18N[loc]})
            print(f"[UP] {p.name} – creato ex novo con 'news'")
            continue
        try:
            doc = tolerant_load(p)
        except json.JSONDecodeError:
            errors.append(p)
            continue
        before_keys = set((doc.get("news") or {}).keys())
        news = dict(doc.get("news") or {})
        for k, v in NEWS_I18N[loc].items():
            if k not in news:
                news[k] = v
        doc["news"] = news
        added = [k for k in news.keys() if k not in before_keys]
        backup(p)
        write_json(p, doc)
        if added:
            print(f"[UP] {p.name} – aggiunte: {', '.join(added)} (UTF-8)")
        else:
            print(f"[OK] {p.name} – nessuna nuova chiave (normalizzato UTF-8)")
    if errors:
        print("[FAIL] Alcuni file JSON restano invalidi:")
        for p in errors:
            print(f"  - {p}")
        sys.exit(1)

def upsert_detail_page() -> None:
    write_text(DETAIL_PATH, DETAIL_CODE)
    print(f"[UP] Dettaglio news scritto: {DETAIL_PATH.relative_to(REPO)}")

def main() -> None:
    if not WEBAPP.exists():
        print(f"[ERR] Cartella webapp non trovata: {WEBAPP}")
        sys.exit(1)
    upsert_detail_page()
    normalize_and_merge_i18n()
    print("[DONE] PL-2 setup completato.")

if __name__ == "__main__":
    main()
