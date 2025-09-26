# Tools/fix_locale_props.py
import re, sys, argparse
from pathlib import Path

ENC = "utf-8"

def read(path: Path) -> str:
    return path.read_text(encoding=ENC)

def write(path: Path, txt: str):
    # UTF-8 senza BOM
    path.write_text(txt, encoding=ENC, newline="\n")

def backup(path: Path):
    b = path.with_suffix(path.suffix + ".bak")
    if not b.exists():
        b.write_text(path.read_text(encoding=ENC), encoding=ENC)
    return b

def patch_newspage(p: Path, dry: bool) -> bool:
    src = read(p)
    orig = src

    # Aggiunge locale={locale} al componente NewsList se assente
    # Casi: <NewsList/> , <NewsList /> , con props varie
    def repl(m):
        inside = m.group(1)
        if re.search(r"\blocale\s*=", inside):
            return m.group(0)  # già presente
        # Inserisce prima di eventuale '/>' o '>'
        inside2 = inside.strip()
        if inside2.endswith("/"):
            inside2 = inside2[:-1].rstrip()
        if inside2:
            inside2 += " "
        inside2 += "locale={locale}"
        return "<NewsList " + inside2 + " />"

    src = re.sub(r"<NewsList\s*(.*?)\s*/>", repl, src)

    if src != orig and not dry:
        backup(p)
        write(p, src)
    return src != orig

def ensure_optional_locale_in_newslist(p: Path, dry: bool) -> bool:
    src = read(p)
    orig = src
    changed = False

    # 1) rende opzionale la prop locale nel tipo Props
    #    type Props = { locale: string } -> locale?: string
    src2, n = re.subn(r"(\blocale\s*:\s*string\b)", "locale?: string", src)
    if n > 0:
        src = src2
        changed = True

    # 2) importa useLocale se serve
    if "useLocale" not in src:
        # prova ad aggiungere a import da 'next-intl'
        src2, n = re.subn(
            r"(from\s*['\"]next-intl['\"]\s*;)",
            r", useLocale \1",
            src
        )
        if n == 0:
            # non c’è import da next-intl: aggiungiamone uno minimale
            src2 = "import { useLocale } from 'next-intl';\n" + src
        src = src2
        changed = True

    # 3) default locale derivato se non passato
    #    const loc = locale ?? useLocale();
    if "locale ?? useLocale()" not in src:
        # se esiste una riga const ... = props.locale... cerca pattern semplice
        if re.search(r"\bconst\s+\w+\s*=\s*locale\b", src):
            src2 = re.sub(r"\bconst\s+(\w+)\s*=\s*locale\b",
                          r"const \1 = locale ?? useLocale()", src)
        else:
            # Inseriamo subito dopo l’apertura del componente
            src2 = re.sub(
                r"(export\s+default\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)",
                r"\1\n  const loc = locale ?? useLocale();",
                src
            )
        if src2 != src:
            src = src2
            changed = True

    if changed and not dry:
        backup(p)
        write(p, src)
    return changed

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="webapp", help="radice progetto webapp")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    news_page = root / "app" / "[locale]" / "news" / "page.tsx"
    news_list = root / "components" / "NewsList.tsx"

    touched = []

    if news_list.exists():
        if ensure_optional_locale_in_newslist(news_list, args.dry_run):
            touched.append(news_list)
    else:
        print(f"[WARN] Non trovato {news_list}")

    if news_page.exists():
        if patch_newspage(news_page, args.dry_run):
            touched.append(news_page)
    else:
        print(f"[WARN] Non trovato {news_page}")

    if args.dry_run:
        print("[DRY] Modifiche che verrebbero applicate:")
        for p in touched:
            print("  -", p)
    else:
        if touched:
            print("[OK] Patch applicate:")
            for p in touched:
                print("  -", p)
        else:
            print("[OK] Nessuna modifica necessaria.")

if __name__ == "__main__":
    main()
