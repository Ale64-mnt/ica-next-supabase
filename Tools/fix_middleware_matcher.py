# Tools/fix_middleware_matcher.py
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "webapp"
p = ROOT / "middleware.ts"

content = """
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

// Intercetta tutto tranne asset statici, API, _next e _vercel
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\\\..*).*)']
};
""".lstrip()

p.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
print(f"✓ Riscritto {p}")
