# tools/fix_newline_write.py
from pathlib import Path
import re

script = Path("tools/pl4_editorial_styles.py")
if not script.exists():
    raise SystemExit(f"[ERR] File non trovato: {script}")

text = script.read_text(encoding="utf-8")
new_text = re.sub(r'newline="\\\\n"', 'newline="\\n"', text)

if text != new_text:
    script.write_text(new_text, encoding="utf-8", newline="\n")
    print(f"[UP] Fix applicato a {script}")
else:
    print("[OK] Nessuna sostituzione necessaria")
