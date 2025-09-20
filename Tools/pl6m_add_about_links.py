# -*- coding: utf-8 -*-
"""
Tools/pl6m_add_about_links.py
Aggiunge il link "Chi siamo / About us" al SiteHeader e SiteFooter in modo robusto:
- garantisce import Link e useTranslations
- inietta const t = useTranslations("nav") se manca
- inserisce <li><Link href="/[locale]/chi-siamo" locale>{t("about")}</Link></li> nel primo <ul> del menu header (o crea un <ul>)
- inserisce <Link ...>{t("about")}</Link> nel primo <nav> del footer (o crea una mini-nav)
- aggiorna it.json / en.json con nav.about
Idempotente: non duplica se esiste già un link a "chi-siamo" o {t("about")}
Esegui dalla ROOT del repo:
  .\.venv\Scripts\python.exe Tools\pl6m_add_about_links.py
"""

from __future__ import annotations
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
HEADER = WEBAPP / "components" / "SiteHeader.tsx"
FOOTER = WEBAPP / "components" / "SiteFooter.tsx"
IT_JSON = WEBAPP / "messages" / "it.json"
EN_JSON = WEBAPP / "messages" / "en.json"

ABOUT_LI = '<li><Link href="/[locale]/chi-siamo" locale>{t("about")}</Link></li>'
ABOUT_A  = '<Link href="/[locale]/chi-siamo" locale>{t("about")}</Link>'

def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace") if path.exists() else ""

def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")

def ensure_import(text: str, spec: str, source: str) -> str:
    """
    Garantisce: import { spec } from "source";  (oppure default per Link)
    """
    if spec == "default:Link":
        # Link default import
        if re.search(r'^\s*import\s+Link\s+from\s+[\'"]next/link[\'"]\s*;', text, flags=re.M):
            return text
        return f'import Link from "next/link";\n' + text

    # named import
    # prova a fondere se esiste già un import dalla stessa source
    m = re.search(r'^\s*import\s+\{([^}]*)\}\s+from\s+[\'"]%s[\'"]\s*;' % re.escape(source), text, flags=re.M)
    if m:
        names = [n.strip() for n in m.group(1).split(",") if n.strip()]
        if spec not in names:
            names.append(spec)
            merged = "import { " + ", ".join(sorted(set(names))) + f' }} from "{source}";'
            return text[:m.start()] + merged + text[m.end():]
        return text
    # altrimenti aggiungi un nuovo import named
    return f'import {{ {spec} }} from "{source}";\n' + text

def ensure_useTranslations_var(text: str) -> str:
    """
    Inserisce `const t = useTranslations("nav");` dopo l'inizio del primo componente export function / export default function
    se nel file non è già presente `useTranslations(` o `const t = useTranslations("nav")`.
    """
    if "useTranslations(" in text and "const t =" in text:
        return text

    # cerca inizio componente
    comp_re = re.compile(r'^\s*export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\(', flags=re.M)
    m = comp_re.search(text)
    if not m:
        return text  # non forziamo se pattern ignoto

    # trova la riga dopo l'opening brace della function (prima '{' dopo il match)
    brace_idx = text.find("{", m.end())
    if brace_idx == -1:
        return text
    insert_pos = brace_idx + 1

    inject = '\n  const t = useTranslations("nav");\n'
    # evita doppione
    if 'useTranslations("nav")' in text:
        return text
    return text[:insert_pos] + inject + text[insert_pos:]

def inject_in_first_ul(text: str, li_html: str) -> tuple[str, bool]:
    """
    Inserisce <li>... nel primo blocco <ul>...</ul>. Se non esiste <ul>, crea un blocco
    ul prima della chiusura di </nav>. Restituisce (nuovo_testo, modified?).
    """
    if 'chi-siamo' in text or '{t("about")}' in text:
        return text, False

    ul_re = re.compile(r"<ul[^>]*>([\s\S]*?)</ul>", flags=re.I)
    m = ul_re.search(text)
    if m:
        inner = m.group(1)
        if li_html in inner:
            return text, False
        new_inner = inner.rstrip() + ("\n  " if not inner.endswith("\n") else "") + "  " + li_html + "\n"
        new_text = text[:m.start(1)] + new_inner + text[m.end(1):]
        return new_text, True

    # se non esiste <ul>, prova ad iniettare prima di </nav>
    nav_close = re.search(r"</nav>", text, flags=re.I)
    if nav_close:
        ul_block = f'\n  <ul className="flex gap-6 text-sm">\n    {li_html}\n  </ul>\n'
        new_text = text[:nav_close.start()] + ul_block + text[nav_close.start():]
        return new_text, True

    return text, False

def inject_in_first_nav(text: str, a_html: str) -> tuple[str, bool]:
    """
    Inserisce <Link ...>{t("about")}</Link> nel primo <nav ...>...</nav>.
    Se non trova nav, prova a inserirlo nel footer prima di </footer>.
    """
    if 'chi-siamo' in text or '{t("about")}' in text:
        return text, False

    # primo blocco <nav>...</nav>
    nav_re = re.compile(r"<nav[^>]*>([\s\S]*?)</nav>", flags=re.I)
    m = nav_re.search(text)
    if m:
        inner = m.group(1)
        if a_html in inner:
            return text, False
        # inserisci con uno spazio separatore se già ci sono link
        sep = "" if inner.strip() == "" else " "
        new_inner = inner.rstrip() + f"{sep}{a_html}\n"
        new_text = text[:m.start(1)] + new_inner + text[m.end(1):]
        return new_text, True

    # se non c'è <nav>, prova prima di </footer>
    foot_close = re.search(r"</footer>", text, flags=re.I)
    if foot_close:
        nav_block = f'\n  <nav className="flex justify-center gap-4 mb-3">\n    {a_html}\n  </nav>\n'
        new_text = text[:foot_close.start()] + nav_block + text[foot_close.start():]
        return new_text, True

    return text, False

def ensure_i18n_key(path: Path, value: str) -> None:
    if not path.exists():
        print(f"[WARN] {path} non trovato")
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"[WARN] {path} JSON non valido: {e}")
        return
    nav = data.setdefault("nav", {})
    if "about" not in nav:
        nav["about"] = value
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[PATCH] {path.name}: aggiunta nav.about = {value}")
    else:
        print(f"[OK] {path.name}: nav.about già presente")

def patch_tsx(path: Path, is_header: bool) -> None:
    if not path.exists():
        print(f"[WARN] {path} non trovato")
        return

    text = read(path)

    # garantisci import Link e useTranslations
    text = ensure_import(text, "default:Link", "next/link")
    text = ensure_import(text, "useTranslations", "next-intl")
    # garantisci const t = useTranslations("nav")
    text = ensure_useTranslations_var(text)

    modified = False
    if is_header:
        text2, mod = inject_in_first_ul(text, ABOUT_LI)
        text = text2; modified = modified or mod
    else:
        text2, mod = inject_in_first_nav(text, ABOUT_A)
        text = text2; modified = modified or mod

    if modified:
        write(path, text)
        print(f"[PATCH] {path.name}: inserito link About/Chi siamo")
    else:
        print(f"[OK] {path.name}: nessuna modifica necessaria")

def main():
    patch_tsx(HEADER, is_header=True)
    patch_tsx(FOOTER, is_header=False)
    ensure_i18n_key(IT_JSON, "Chi siamo")
    ensure_i18n_key(EN_JSON, "About us")

if __name__ == "__main__":
    main()
