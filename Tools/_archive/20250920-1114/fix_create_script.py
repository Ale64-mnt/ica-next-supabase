# Tools/fix_create_script.py
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
script = ROOT / "Tools" / "create_next_supabase_skeleton.py"
txt = script.read_text(encoding="utf-8")

# Pattern molto tollerante: prende da write(APP/"README.md", r""" fino alla prossima tripla virgoletta (se c'è)
pat = re.compile(r'write\(\s*APP\s*/\s*"README\.md"\s*,\s*r?"""[\s\S]*?"""', re.MULTILINE)

replacement = (
    'write(APP / "README.md", """'
    "# {project_name}\n\n"
    "Skeleton Next.js + Supabase generato automaticamente.\n\n"
    "## Struttura\n"
    "- app/ – router, pagine e layout\n"
    "- lib/ – client Supabase e utilità\n"
    "- components/ – componenti UI riutilizzabili\n"
    "- .env.local.example – variabili ambiente richieste\n\n"
    "## Avvio rapido\n"
    "1. Copia `.env.local.example` in `.env.local` e riempi SUPABASE_URL e SUPABASE_ANON_KEY\n"
    "2. `pnpm install` (o `npm install`/`yarn`)\n"
    "3. `pnpm dev` e apri http://localhost:3000\n"
    '""")'
)

new_txt, n = pat.subn(replacement, txt, count=1)

if n == 0:
    raise SystemExit("⚠️  Non ho trovato il blocco README da correggere. Lo script potrebbe essere già a posto.")
script.write_text(new_txt, encoding="utf-8")
print("✅ Patch applicata: blocco README chiuso correttamente.")
