# -*- coding: utf-8 -*-
"""
pl6_bootstrap_seo_privacy_newsletter.py
Crea/aggiorna i file "consigliati" per il pre-lancio:
- app/sitemap.ts, app/robots.ts
- components/Analytics.tsx, components/CookieBanner.tsx
- app/it|en/privacy/page.tsx
- app/it|en/newsletter/page.tsx
- aggiorna app/[locale]/layout.tsx per importare & rendere <Analytics/> e <CookieBanner/>
- integra .env.local con placeholder mancanti

Idempotente: non sovrascrive file esistenti; aggiorna il layout con patch mirate.
Exit codes: 0 OK, 1 WARNING, 2 ERROR
"""

from __future__ import annotations
import re
import sys
from pathlib import Path

ROOT = Path(".").resolve()
WEBAPP = ROOT / "webapp"
ENV_PATH = WEBAPP / ".env.local"

CREATIONS: dict[Path, str] = {}

# ---------- Contenuti file ----------
CREATIONS[WEBAPP / "app" / "sitemap.ts"] = r"""import type { MetadataRoute } from 'next';

type NewsRow = { slug: string; lang: string };
const LOCALES = ['it','en'] as const;

async function fetchNews(): Promise<NewsRow[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!base || !anon) return [];
  const url = `${base}/rest/v1/news?select=slug,lang`;
  const r = await fetch(url, { headers: { apikey: anon, Authorization: `Bearer ${anon}` }, next: { revalidate: 60 }});
  if (!r.ok) return [];
  return r.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  const now = new Date();
  const baseEntries: MetadataRoute.Sitemap = LOCALES.map(l => ({
    url: `${site}/${l}`, lastModified: now, changeFrequency: 'daily', priority: 0.8
  }));

  const staticEntries: MetadataRoute.Sitemap = LOCALES.flatMap(l => [
    { url: `${site}/${l}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site}/${l}/newsletter`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]);

  const news = await fetchNews();
  const newsEntries: MetadataRoute.Sitemap = news.map(n => ({
    url: `${site}/${n.lang}/news/${encodeURIComponent(n.slug)}`,
    lastModified: now, changeFrequency: 'weekly', priority: 0.6
  }));

  return [...baseEntries, ...staticEntries, ...newsEntries];
}
"""

CREATIONS[WEBAPP / "app" / "robots.ts"] = r"""import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
"""

CREATIONS[WEBAPP / "components" / "Analytics.tsx"] = r"""'use client';
import { useEffect } from 'react';

export default function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  useEffect(() => {
    if (!ga) return;
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s1);

    const s2 = document.createElement('script');
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', '${ga}');
    `;
    document.head.appendChild(s2);
  }, [ga]);
  return null;
}
"""

CREATIONS[WEBAPP / "components" / "CookieBanner.tsx"] = r"""'use client';
import { useEffect, useState } from 'react';
const KEY = 'cookie-consent-v1';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const ok = typeof window !== 'undefined' && localStorage.getItem(KEY);
    setShow(!ok);
  }, []);
  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 w-full max-w-4xl rounded-2xl bg-gray-900/90 p-4 text-white shadow-lg backdrop-blur">
        <p className="text-sm">
          Usiamo cookie tecnici e, se acconsenti, metriche anonime. Leggi la{' '}
          <a href="/it/privacy" className="underline">Privacy</a>.
        </p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => { localStorage.setItem(KEY,'ok'); setShow(false); }}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-white text-gray-900">
            Accetto
          </button>
          <button onClick={() => { localStorage.setItem(KEY,'dismissed'); setShow(false); }}
                  className="rounded-xl px-3 py-2 text-sm bg-gray-700">
            Solo tecnici
          </button>
        </div>
      </div>
    </div>
  );
}
"""

CREATIONS[WEBAPP / "app" / "it" / "privacy" / "page.tsx"] = r"""export const dynamic = 'force-static';
export default function PrivacyIt() {
  return (
    <section className="prose max-w-3xl">
      <h1>Informativa Privacy (MVP)</h1>
      <p>Questa pagina descrive in sintesi il trattamento dati per il pre-lancio.</p>
      <h2>Titolare</h2>
      <p>Institute for Conscious Action (ICA) — contatti: info@example.org</p>
      <h2>Dati trattati</h2>
      <ul>
        <li>Log tecnici e dati necessari al funzionamento del sito.</li>
        <li>Email fornita per la newsletter (se compilata).</li>
        <li>Metriche anonime (se GA4 attivo).</li>
      </ul>
      <h2>Diritti</h2>
      <p>Puoi richiedere accesso/cancellazione scrivendo all’indirizzo sopra.</p>
      <p>Versione minimale per MVP — sarà estesa alla messa in produzione.</p>
    </section>
  );
}
"""

CREATIONS[WEBAPP / "app" / "en" / "privacy" / "page.tsx"] = r"""export const dynamic = 'force-static';
export default function PrivacyEn() {
  return (
    <section className="prose max-w-3xl">
      <h1>Privacy Notice (MVP)</h1>
      <p>This page briefly describes data processing for the pre-launch.</p>
      <h2>Controller</h2>
      <p>Institute for Conscious Action (ICA) — contact: info@example.org</p>
      <h2>Data</h2>
      <ul>
        <li>Technical logs and data required for site operation.</li>
        <li>Email provided for newsletter, if any.</li>
        <li>Anonymous metrics (if GA4 enabled).</li>
      </ul>
      <h2>Rights</h2>
      <p>You can request access/erasure via the contact above.</p>
      <p>Minimal MVP version — to be expanded for production.</p>
    </section>
  );
}
"""

CREATIONS[WEBAPP / "app" / "it" / "newsletter" / "page.tsx"] = r"""export const dynamic = 'force-static';
export default function NewsletterIt() {
  const action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;
  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Newsletter</h1>
      <p className="mb-6 text-gray-600">Iscriviti per ricevere news e guide.</p>
      <form action={action} method="POST" className="space-y-3">
        <input type="email" name="email" required placeholder="la-tua@email.it"
               className="w-full rounded-xl border px-4 py-3" />
        <button className="rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">Iscrivimi</button>
      </form>
      {!action && (<p className="mt-4 text-sm text-red-600">
        Configura NEXT_PUBLIC_NEWSLETTER_ACTION per abilitare il form.
      </p>)}
    </section>
  );
}
"""

CREATIONS[WEBAPP / "app" / "en" / "newsletter" / "page.tsx"] = r"""export const dynamic = 'force-static';
export default function NewsletterEn() {
  const action = process.env.NEXT_PUBLIC_NEWSLETTER_ACTION;
  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Newsletter</h1>
      <p className="mb-6 text-gray-600">Subscribe to receive updates and guides.</p>
      <form action={action} method="POST" className="space-y-3">
        <input type="email" name="email" required placeholder="you@example.com"
               className="w-full rounded-xl border px-4 py-3" />
        <button className="rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">Subscribe</button>
      </form>
      {!action && (<p className="mt-4 text-sm text-red-600">
        Set NEXT_PUBLIC_NEWSLETTER_ACTION to enable the form.
      </p>)}
    </section>
  );
}
"""

# ---------- Helper ----------
def ensure_file(path: Path, content: str) -> tuple[bool, str]:
    """Crea il file se non esiste. Ritorna (created, msg)."""
    if path.exists():
        return False, f"EXIST {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return True, f"CREATE {path.relative_to(ROOT)}"

def patch_layout_add_components(layout_path: Path) -> list[str]:
    """
    Inserisce import e JSX di <Analytics/> e <CookieBanner/> se assenti.
    Funziona su file TSX del layout locale: webapp/app/[locale]/layout.tsx
    """
    logs: list[str] = []
    if not layout_path.exists():
        logs.append(f"MISS  {layout_path.relative_to(ROOT)} (layout non trovato)")
        return logs

    text = layout_path.read_text(encoding="utf-8")

    # Import Analytics
    if "from '@/components/Analytics'" not in text:
        text = re.sub(
            r"(import[^\n]+;\s*)+$",
            lambda m: m.group(0) + "\nimport Analytics from '@/components/Analytics';",
            text,
            count=1,
            flags=re.MULTILINE,
        )
        logs.append("PATCH import Analytics")

    # Import CookieBanner
    if "from '@/components/CookieBanner'" not in text:
        text = re.sub(
            r"(import[^\n]+;\s*)+$",
            lambda m: m.group(0) + "\nimport CookieBanner from '@/components/CookieBanner';",
            text,
            count=1,
            flags=re.MULTILINE,
        )
        logs.append("PATCH import CookieBanner")

    # JSX: prima della chiusura di NextIntlClientProvider/body
    if "<Analytics />" not in text:
        text = text.replace("</NextIntlClientProvider>", "  <Analytics />\n          </NextIntlClientProvider>")
        if "<Analytics />" not in text:
            # fallback: inserisci prima di </body>
            text = text.replace("</body>", "  <Analytics />\n      </body>")
        logs.append("PATCH JSX <Analytics/>")

    if "<CookieBanner />" not in text:
        text = text.replace("</NextIntlClientProvider>", "  <CookieBanner />\n          </NextIntlClientProvider>")
        if "<CookieBanner />" not in text:
            text = text.replace("</body>", "  <CookieBanner />\n      </body>")
        logs.append("PATCH JSX <CookieBanner/>")

    layout_path.write_text(text, encoding="utf-8")
    return logs

def ensure_env_placeholders(env_path: Path) -> list[str]:
    logs: list[str] = []
    want = {
        "NEXT_PUBLIC_SITE_URL": "https://www.tuodominio.tld",
        "NEXT_PUBLIC_GA_ID": "G-XXXXXXX",
        "NEXT_PUBLIC_NEWSLETTER_ACTION": "",
    }
    existing = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                existing[k.strip()] = v.strip()

    lines = env_path.read_text(encoding="utf-8").splitlines() if env_path.exists() else []
    changed = False
    for k, v in want.items():
        if k not in existing:
            lines.append(f"{k}={v}")
            logs.append(f"ENV+ {k}")
            changed = True

    if changed:
        env_path.parent.mkdir(parents=True, exist_ok=True)
        env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    else:
        logs.append("ENV ok (nessun placeholder aggiunto)")
    return logs

# ---------- Main ----------
def main() -> int:
    created = 0
    notes: list[str] = []

    # 1) File consigliati
    for path, content in CREATIONS.items():
        ok, msg = ensure_file(path, content)
        notes.append(msg)
        if ok: created += 1

    # 2) Patch layout locale
    layout_path = WEBAPP / "app" / "[locale]" / "layout.tsx"
    notes.extend(patch_layout_add_components(layout_path))

    # 3) Env placeholders
    notes.extend(ensure_env_placeholders(ENV_PATH))

    # Output log sintetico
    print("=== PL-6 bootstrap ===")
    for n in notes:
        print(n)
    print(f"Created files: {created}")

    # Exit code
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(2)
