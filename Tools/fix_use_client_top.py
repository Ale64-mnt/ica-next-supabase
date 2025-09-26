from pathlib import Path
import re

ENC = "utf-8"

def normalize_use_client(p: Path) -> bool:
    txt = p.read_text(encoding=ENC)
    orig = txt

    # togli BOM ovunque
    txt = txt.encode(ENC).decode(ENC)

    # rimuovi tutte le occorrenze di 'use client' (sia singolo o doppio apice, con ; opzionale)
    txt = re.sub(r'^\s*(["\'])use client\1;?\s*\n', '', txt, flags=re.MULTILINE)

    # reinserisci come primissima riga
    txt = "'use client';\n" + txt.lstrip()

    if txt != orig:
        # backup
        bak = p.with_suffix(p.suffix + ".bak")
        if not bak.exists():
            bak.write_text(orig, encoding=ENC)
        p.write_text(txt, encoding=ENC, newline="\n")
        return True
    return False

def main():
    root = Path("webapp").resolve()
    target = root / "components" / "NewsList.tsx"
    if not target.exists():
        print(f"[WARN] Non trovato: {target}")
        return
    changed = normalize_use_client(target)
    print("[OK] Sistemato 'use client' in NewsList.tsx" if changed else "[OK] Nessuna modifica necessaria")

if __name__ == "__main__":
    main()
