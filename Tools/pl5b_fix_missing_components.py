# tools/pl5b_fix_missing_components.py
# -*- coding: utf-8 -*-
"""
Ripristina/crea SiteHeader.tsx e SiteFooter.tsx in webapp/components
e normalizza gli import in webapp/app/[locale]/layout.tsx
"""

from pathlib import Path
import re
import textwrap

ROOT = Path(__file__).resolve().parents[1]
COMP_DIR = ROOT / "webapp" / "components"
LAYOUT = ROOT / "webapp" / "app" / "[locale]" / "layout.tsx"

SITE_HEADER = textwrap.dedent("""\
'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...props}>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)?.[0] ?? "";
  return (
    <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <button aria-label="Search" className="p-2 rounded hover:bg-gray-100"><IconSearch /></button>
          <Link href={`/${locale || ""}`} className="inline-flex items-center">
            <span className="sr-only">Home</span>
            <Image src="/logo-edunova.png" alt="Edunovà" width={200} height={48} className="h-8 md:h-10 w-auto" priority />
          </Link>
          <button aria-label="Menu" className="p-2 rounded hover:bg-gray-100"><IconMenu /></button>
        </div>
      </div>
    </div>
  );
}
""")

SITE_FOOTER = textwrap.dedent("""\
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <nav className="flex gap-5 text-sm">
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/contatti" className="hover:underline">Contatti</a>
            <a href="/about" className="hover:underline">Chi siamo</a>
          </nav>
          <p className="text-sm">&copy; {new Date().getFullYear()} Edunovà – Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
""")

def ensure_components():
    COMP_DIR.mkdir(parents=True, exist_ok=True)
    (COMP_DIR / "SiteHeader.tsx").write_text(SITE_HEADER, encoding="utf-8", newline="\n")
    (COMP_DIR / "SiteFooter.tsx").write_text(SITE_FOOTER, encoding="utf-8", newline="\n")
    print("[OK] Creati/aggiornati: components/SiteHeader.tsx, components/SiteFooter.tsx")

def fix_layout_imports():
    if not LAYOUT.exists():
        print(f"[WARN] layout non trovato: {LAYOUT}")
        return
    src = LAYOUT.read_text(encoding="utf-8")

    # Aggiungi import se mancanti o normalizza estensione .tsx
    if 'SiteHeader' not in src:
        src = re.sub(r'(\nimport [^\n]*;[\r\n]*)+$', r'\\g<0>import SiteHeader from "@/components/SiteHeader.tsx";\n', src, count=1, flags=re.M)
    else:
        src = src.replace('import SiteHeader from "@/components/SiteHeader";',
                          'import SiteHeader from "@/components/SiteHeader.tsx"')

    if 'SiteFooter' not in src:
        src = re.sub(r'(\nimport [^\n]*;[\r\n]*)+$', r'\\g<0>import SiteFooter from "@/components/SiteFooter.tsx";\n', src, count=1, flags=re.M)
    else:
        src = src.replace('import SiteFooter from "@/components/SiteFooter";',
                          'import SiteFooter from "@/components/SiteFooter.tsx"')

    # Inject nei tag body se mancanti
    if "<SiteHeader" not in src:
        src = src.replace("<body>", "<body>\n      <SiteHeader />")
    if "<SiteFooter" not in src:
        src = src.replace("</body>", "      <SiteFooter />\n    </body>")

    LAYOUT.write_text(src, encoding="utf-8", newline="\n")
    print("[OK] layout.tsx normalizzato (import + markup)")

def main():
    ensure_components()
    fix_layout_imports()
    print("[DONE] Fix completato. Riavvia/ricarica `npm run dev` se necessario.")

if __name__ == "__main__":
    main()
