# -*- coding: utf-8 -*-
"""
i18n_sync_from_en.py
Sincronizza i file i18n in webapp/messages/ prendendo come struttura di riferimento en.json.
- Aggiunge chiavi mancanti alle altre lingue (deep-merge).
- Default utili: home.empty per EN/IT (altre lingue copiano EN).
- Rimuove BOM e salva JSON compatto, UTF-8.
- Warning se in en.json ci sono stringhe che "sembrano italiane".

Uso:
  python Tools/i18n_sync_from_en.py
Exit codes: 0 OK, 2 errori I/O/JSON.
"""
from __future__ import annotations
from pathlib import Path
import json
import re
import sys
from typing import Any, Dict

ROOT = Path(".").resolve()
MSG_DIR = ROOT / "webapp" / "messages"
EN = MSG_DIR / "en.json"

# Default (minimi) che vogliamo garantire
EN_DEFAULTS = {
    "home": {
        "empty": "No content available."
    }
}
IT_DEFAULTS = {
    "home": {
        "empty": "Nessun contenuto disponibile."
    }
}

ITALIAN_HINT_RE = re.compile(
    r"\b(benvenut|news|guida|titolo|descrizion|contenut|iscriviti|privacy|cookie|ciao|annuncio)\b",
    flags=re.IGNORECASE,
)

def read_json(path: Path) -> Dict[str, Any]:
    try:
        raw = path.read_text(encoding="utf-8-sig")  # gestisce BOM
        return json.loads(raw)
    except Exception as e:
        raise RuntimeError(f"[ERROR] Lettura/parse JSON: {path} -> {e}")

def write_json(path: Path, data: Dict[str, Any]) -> None:
    try:
        # salvataggio compatto ma leggibile
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except Exception as e:
        raise RuntimeError(f"[ERROR] Scrittura JSON: {path} -> {e}")

def deep_merge_fill(target: Dict[str, Any], source: Dict[str, Any]) -> bool:
    """
    Inserisce nel target tutte le chiavi assenti presenti in source (deep-merge "fill").
    Ritorna True se ha aggiunto qualcosa.
    """
    changed = False
    for k, v in source.items():
        if isinstance(v, dict):
            if k not in target or not isinstance(target.get(k), dict):
                target.setdefault(k, {})
                changed = True
            changed = deep_merge_fill(target[k], v) or changed
        else:
            if k not in target:
                target[k] = v
                changed = True
    return changed

def ensure_defaults(locale: str, data: Dict[str, Any]) -> bool:
    """
    Applica i DEFAULTS minimi per alcune lingue.
    """
    before = json.dumps(data, sort_keys=True)
    if locale == "en":
        deep_merge_fill(data, EN_DEFAULTS)
    elif locale == "it":
        deep_merge_fill(data, IT_DEFAULTS)
    # per altre lingue lasciamo il merge da EN e basta
    after = json.dumps(data, sort_keys=True)
    return before != after

def flatten_strings(obj: Any) -> list[str]:
    acc = []
    if isinstance(obj, dict):
        for v in obj.values():
            acc.extend(flatten_strings(v))
    elif isinstance(obj, list):
        for v in obj:
            acc.extend(flatten_strings(v))
    elif isinstance(obj, str):
        acc.append(obj)
    return acc

def looks_italian(text: str) -> bool:
    return bool(ITALIAN_HINT_RE.search(text)) or any(ch in "àèéìòóù" for ch in text)

def main() -> int:
    if not EN.exists():
        print(f"[ERROR] File di riferimento mancante: {EN}")
        return 2

    # 1) carica EN
    try:
        en_data = read_json(EN)
    except RuntimeError as e:
        print(e)
        return 2

    # warning se EN "sembra italiano"
    en_strings = " ".join(flatten_strings(en_data))[:5000]
    if looks_italian(en_strings):
        print("[WARN] en.json contiene stringhe che sembrano italiane. Controlla le traduzioni inglesi.")

    # 2) garantisci defaults in EN
    changed_en = ensure_defaults("en", en_data)
    if changed_en:
        write_json(EN, en_data)
        print(f"[PATCH] Default inseriti in {EN.relative_to(ROOT)}")

    # 3) per ogni altro locale, deep-merge struttura EN e defaults specifici
    total_added = 0
    for path in sorted(MSG_DIR.glob("*.json")):
        if path.name == "en.json":
            continue
        try:
            data = read_json(path)
        except RuntimeError as e:
            print(e)
            return 2

        added_by_merge = deep_merge_fill(data, en_data)
        added_defaults = ensure_defaults(path.stem, data)

        if added_by_merge or added_defaults:
            write_json(path, data)
            print(f"[PATCH] {path.relative_to(ROOT)} (+merge:{added_by_merge}, +defaults:{added_defaults})")
            total_added += 1
        else:
            print(f"[OK] {path.relative_to(ROOT)} già allineato")

    # 4) fine
    if total_added == 0 and not changed_en:
        print("[OK] Nessuna modifica necessaria. Tutte le lingue sono allineate.")
    else:
        print("[DONE] i18n sincronizzato.")

    return 0

if __name__ == "__main__":
    sys.exit(main())
