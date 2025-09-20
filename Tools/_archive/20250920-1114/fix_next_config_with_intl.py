# Tools/fix_next_config_with_intl.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]            # cartella progetto (…/ica-Next.js + Supabase)
APP  = ROOT / "webapp"
NEXT = APP / "next.config.mjs"

content = """\
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./next-intl.config.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default withNextIntl(nextConfig);
"""

NEXT.write_text(content, encoding='utf-8')

print("✅ next.config.mjs aggiornato: plugin next-intl collegato a ./next-intl.config.ts")
