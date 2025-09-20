# tools/fix_next_image_hosts.py
# -*- coding: utf-8 -*-
"""
Aggiunge la configurazione immagini remote a webapp/next.config.mjs:
- placehold.co (placeholder covers)
- <SUPABASE_HOST> da NEXT_PUBLIC_SUPABASE_URL (path storage pubblico)
Funziona con il classico schema:
  const nextConfig = { ... }
  export default nextConfig
Se esiste già "images", prova ad aggiungere/mergere i remotePatterns mancanti.
"""

from pathlib import Path
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
WEBAPP = ROOT / "webapp"
ENV = WEBAPP / ".env.local"
NEXT_CONFIG = WEBAPP / "next.config.mjs"

def get_supabase_host() -> str | None:
    if not ENV.exists():
        return None
    text = ENV.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r"^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+)$", text, flags=re.M)
    if not m:
        return None
    url = m.group(1).strip().strip('"').strip("'")
    try:
        host = urlparse(url).hostname
        return host
    except Exception:
        return None

REMOTE_SNIPPET = """images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "%SUPABASE_HOST%", pathname: "/storage/v1/object/public/**" }
    ]
  },"""

def main():
    if not NEXT_CONFIG.exists():
        raise SystemExit(f"[ERR] next.config.mjs non trovato: {NEXT_CONFIG}")

    host = get_supabase_host() or "twwgfrbcndouazujgcma.supabase.co"  # fallback
    snippet = REMOTE_SNIPPET.replace("%SUPABASE_HOST%", host)

    text = NEXT_CONFIG.read_text(encoding="utf-8")

    # se già configurato, usciamo
    if "placehold.co" in text and host in text:
        print("[OK] Host immagini già configurati in next.config.mjs")
        return

    # 1) se esiste già "images:" prova a inserire i pattern mancanti
    if "images:" in text:
        changed = False
        if "placehold.co" not in text:
            text = re.sub(r"images\s*:\s*\{", 'images: {\n    remotePatterns: [\n      { protocol: "https", hostname: "placehold.co" },', text, count=1)
            changed = True
        if host not in text:
            # se c'è già remotePatterns, appendiamo prima di chiuderlo
            if "remotePatterns" in text:
                text = re.sub(
                    r"remotePatterns\s*:\s*\[(.*?)\]",
                    lambda m: f'remotePatterns: [{m.group(1)}{"," if m.group(1).strip() else ""} {{ protocol: "https", hostname: "{host}", pathname: "/storage/v1/object/public/**" }}]',
                    text,
                    flags=re.S, count=1
                )
                changed = True
            else:
                # aggiungiamo intero blocco images con remotePatterns (fallback brutale)
                text = text.replace("images:", snippet + "\n  // images (precedente) disabilitata: ", 1)
                changed = True
        if changed:
            NEXT_CONFIG.write_text(text, encoding="utf-8", newline="\n")
            print("[UP] Aggiornato next.config.mjs (merge immagini)")
            return

    # 2) inseriamo un blocco images dentro nextConfig se non esiste
    m = re.search(r"const\s+nextConfig\s*=\s*\{\s*", text)
    if not m:
        raise SystemExit("[ERR] Non ho trovato 'const nextConfig = {' in next.config.mjs")

    insert_at = m.end()
    new_text = text[:insert_at] + "\n  " + snippet + text[insert_at:]
    NEXT_CONFIG.write_text(new_text, encoding="utf-8", newline="\n")
    print("[UP] Inserito blocco images in next.config.mjs")

if __name__ == "__main__":
    main()
