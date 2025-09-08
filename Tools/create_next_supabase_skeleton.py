# create_next_supabase_skeleton.py
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP = ROOT / "webapp"
SRC = APP / "src"
APP_DIR = SRC / "app"
COMP = SRC / "components"
LIB = SRC / "lib"
LOCALES = ["it", "en", "fr", "de", "es"]

def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print(f"✓ {path.relative_to(ROOT)}")

def main():
    print("==> Creazione scheletro Next.js + Supabase + i18n in ./webapp")

    # package.json
    write(APP / "package.json", r"""
{
  "name": "ica-webapp",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "next": "14.2.5",
    "next-intl": "^3.15.2",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "typescript": "^5.5.4"
  }
}
""")

    # next.config.mjs con i18n
    write(APP / "next.config.mjs", f"""
/** @type {{import('next').NextConfig}} */
const nextConfig = {{
  experimental: {{
    typedRoutes: true
  }},
  i18n: {{
    locales: {LOCALES},
    defaultLocale: "it"
  }}
}};
export default nextConfig;
""")

    # tsconfig
    write(APP / "tsconfig.json", r"""
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

    # env example
    write(APP / ".env.example", r"""
# Copia in .env.local e inserisci le tue chiavi Supabase
NEXT_PUBLIC_SUPABASE_URL=https://TUO-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
""")

    # next-env
    write(APP / "next-env.d.ts", r"""
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation-types/compat/navigation" />
""")

    # .gitignore
    write(APP / ".gitignore", r"""
node_modules
.next
out
.env.local
.env
.DS_Store
""")

    # middleware per next-intl
    write(APP / "middleware.ts", r"""
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['it', 'en', 'fr', 'de', 'es'],
  defaultLocale: 'it'
});

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)'
  ]
};
""")

    # Supabase client
    write(LIB / "supabase-client.ts", r"""
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
""")

    # Header con switcher lingue
    write(COMP / "Header.tsx", r"""
"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

const LOCALES = ["it","en","fr","de","es"] as const;

export default function Header({locale}:{locale:string}) {
  const pathname = usePathname();

  const switchHref = (loc:string) => {
    if (!pathname) return `/${loc}`;
    const parts = pathname.split("/");
    parts[1] = loc;
    return parts.join("/") || `/${loc}`;
  };

  return (
    <header style={{display:'flex', gap:16, padding:16, borderBottom:'1px solid #eee'}}>
      <Link href={`/${locale}`}>Home</Link>
      <Link href={`/${locale}/about`}>Chi siamo</Link>
      <Link href={`/${locale}/news`}>News</Link>

      <div style={{marginLeft:'auto', display:'flex', gap:8}}>
        {LOCALES.map(l => (
          <Link key={l} href={switchHref(l)} style={{opacity: l===locale ? 1 : .6}}>
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
    </header>
  );
}
""")

    # Footer
    write(COMP / "Footer.tsx", r"""
export default function Footer() {
  return (
    <footer style={{padding:16, borderTop:'1px solid #eee', marginTop:24, fontSize:12}}>
      © Institute for Conscious Action
    </footer>
  );
}
""")

    # layout + pagine per ogni locale
    for loc in LOCALES:
        base = APP_DIR / f"[locale]"
        # layout.tsx
        write(base / "layout.tsx", r"""
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Institute for Conscious Action",
  description: "Educazione finanziaria e digitale etica"
};

export default function LocaleLayout({
  params, children
}: {
  params: {locale:string},
  children: React.ReactNode
}) {
  return (
    <html lang={params.locale}>
      <body style={{maxWidth:920, margin:'0 auto', padding:16}}>
        <Header locale={params.locale} />
        <main style={{minHeight: '60vh', paddingTop:16}}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
""")

        # Home
        write(base / "page.tsx", f"""
export default function HomePage() {{
  return (
    <section>
      <h1>Institute for Conscious Action</h1>
      <p>Benvenuto! Questa è la home ({loc}).</p>
      <p>Qui potremo mostrare Highlights, call-to-action, e ultimi articoli.</p>
    </section>
  );
}}
""")

        # Chi siamo
        write(base / "about" / "page.tsx", f"""
export default function AboutPage() {{
  return (
    <section>
      <h1>Chi siamo</h1>
      <p>Pagina informativa in lingua ({loc}).</p>
    </section>
  );
}}
""")

        # News list
        write(base / "news" / "page.tsx", f"""
import Link from "next/link";

export default async function NewsList() {{
  // TODO: caricare la lista da Supabase (tabella: articles)
  const items = [
    {{ id: "demo-1", title: "Esempio articolo 1 ({loc})"}},
    {{ id: "demo-2", title: "Esempio articolo 2 ({loc})"}}
  ];

  return (
    <section>
      <h1>News</h1>
      <ul>
        {{items.map(a => (
          <li key={{a.id}}>
            <Link href={{`/{loc}/news/${{a.id}}`}}>{{a.title}}</Link>
          </li>
        ))}}
      </ul>
    </section>
  );
}}
""")

        # News detail
        write(base / "news" / "[id]" / "page.tsx", f"""
export default async function NewsDetail({{ params }}: {{ params: {{ locale: string; id: string }} }}) {{
  // TODO: fetch da Supabase per params.id + params.locale
  return (
    <article>
      <h1>Articolo: {{params.id}}</h1>
      <p>Contenuto di esempio in lingua ({{params.locale}}).</p>
    </article>
  );
}}
""")

    # README
write(APP / "README.md", """# {project_name}

Skeleton Next.js + Supabase generato automaticamente.

## Struttura
- app/ – router, pagine e layout
- lib/ – client Supabase e utilità
- components/ – componenti UI riutilizzabili
- .env.local.example – variabili ambiente richieste

## Avvio rapido
1. Copia `.env.local.example` in `.env.local` e riempi SUPABASE_URL e SUPABASE_ANON_KEY
2. `pnpm install` (o `npm install`/`yarn`)
3. `pnpm dev` e apri http://localhost:3000
""")