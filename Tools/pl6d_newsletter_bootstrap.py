# -*- coding: utf-8 -*-
"""
pl6d_newsletter_bootstrap.py
Crea pagine newsletter (IT/EN).
- app/it/newsletter/page.tsx
- app/en/newsletter/page.tsx
Form POST a provider esterno (Mailchimp/Brevo).
Idempotente, sintassi verificata.
"""
from __future__ import annotations
from pathlib import Path
import sys

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
IT_PAGE = WEBAPP / "app" / "it" / "newsletter" / "page.tsx"
EN_PAGE = WEBAPP / "app" / "en" / "newsletter" / "page.tsx"

IT_TSX = """export default function NewsletterPage() {
  return (
    <main className="prose mx-auto p-8">
      <h1>Iscriviti alla Newsletter</h1>
      <p>Ricevi aggiornamenti e guide direttamente nella tua casella email.</p>
      <form
        action="https://your-provider-url"
        method="POST"
        className="flex flex-col gap-2 max-w-md"
      >
        <input
          type="email"
          name="EMAIL"
          placeholder="La tua email"
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Iscriviti
        </button>
      </form>
    </main>
  );
}
"""

EN_TSX = """export default function NewsletterPage() {
  return (
    <main className="prose mx-auto p-8">
      <h1>Subscribe to our Newsletter</h1>
      <p>Get updates and guides directly in your inbox.</p>
      <form
        action="https://your-provider-url"
        method="POST"
        className="flex flex-col gap-2 max-w-md"
      >
        <input
          type="email"
          name="EMAIL"
          placeholder="Your email"
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </main>
  );
}
"""

def ensure(path: Path, content: str) -> str:
    if path.exists():
        return f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"CREATE {path.relative_to(ROOT)}"

def main() -> int:
    changes = []
    changes.append(ensure(IT_PAGE, IT_TSX))
    changes.append(ensure(EN_PAGE, EN_TSX))
    print("=== pl6d_newsletter_bootstrap ===")
    for c in changes: print(c)
    return 0

if __name__ == "__main__":
    sys.exit(main())
