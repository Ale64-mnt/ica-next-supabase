# Tools/fix_create_script_step2.py
from __future__ import annotations
import os
from pathlib import Path
import textwrap
import argparse

ROOT = Path(__file__).resolve().parents[1]  # repo root (…/ica-Next.js + Supabase)
WEBAPP = ROOT / "webapp"

def write(fp: Path, content: str):
    fp.parent.mkdir(parents=True, exist_ok=True)
    fp.write_text(textwrap.dedent(content).lstrip(), encoding="utf-8")
    print(f"✓ {fp.relative_to(ROOT)}")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project-name", default="ica-next")
    args = ap.parse_args()
    project = args.project_name

    # --- README ---------------------------------------------------------------
    readme = f"""\
    # {project}

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
    """
    write(WEBAPP / "README.md", readme)

    # --- .env example ---------------------------------------------------------
    write(
        WEBAPP / ".env.local.example",
        """
        # Supabase
        NEXT_PUBLIC_SUPABASE_URL=https://TUO_PROJ_ID.supabase.co
        NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

        # (opzionale) base path del sito
        NEXT_PUBLIC_SITE_URL=http://localhost:3000
        """,
    )

    # --- package.json ----------------------------------------------------------
    write(
        WEBAPP / "package.json",
        f"""
        {{
          "name": "{project}",
          "private": true,
          "version": "0.1.0",
          "scripts": {{
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
          }},
          "dependencies": {{
            "@supabase/supabase-js": "^2.45.4",
            "next": "14.2.5",
            "react": "18.2.0",
            "react-dom": "18.2.0"
          }},
          "devDependencies": {{
            "typescript": "^5.6.2",
            "@types/node": "^20.14.10",
            "@types/react": "^18.3.3",
            "@types/react-dom": "^18.3.0",
            "eslint": "^8.57.0",
            "eslint-config-next": "14.2.5"
          }}
        }}
        """,
    )

    # --- tsconfig --------------------------------------------------------------
    write(
        WEBAPP / "tsconfig.json",
        """
        {
          "compilerOptions": {
            "target": "ES2020",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": false,
            "skipLibCheck": true,
            "strict": true,
            "forceConsistentCasingInFileNames": true,
            "noEmit": true,
            "esModuleInterop": true,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": true,
            "isolatedModules": true,
            "jsx": "preserve",
            "incremental": true,
            "baseUrl": ".",
            "paths": {
              "@/*": ["./*"]
            }
          },
          "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
          "exclude": ["node_modules"]
        }
        """,
    )

    # --- next.config -----------------------------------------------------------
    write(
        WEBAPP / "next.config.mjs",
        """
        /** @type {import('next').NextConfig} */
        const nextConfig = {
          reactStrictMode: true,
          experimental: { appDir: true }
        };
        export default nextConfig;
        """,
    )

    # --- app layout + page + styles -------------------------------------------
    write(
        WEBAPP / "app" / "layout.tsx",
        """
        import "./globals.css";

        export const metadata = {
          title: "ICA Webapp",
          description: "Next.js + Supabase skeleton"
        };

        export default function RootLayout({ children }: { children: React.ReactNode }) {
          return (
            <html lang="it">
              <body>{children}</body>
            </html>
          );
        }
        """,
    )

    write(
        WEBAPP / "app" / "page.tsx",
        """
        import Link from "next/link";

        export default function Home() {
          return (
            <main style={{ padding: 24 }}>
              <h1>Benvenuto 👋</h1>
              <p>Skeleton Next.js + Supabase pronto.</p>
              <ul>
                <li>Modifica <code>app/page.tsx</code></li>
                <li>Configura le variabili in <code>.env.local</code></li>
              </ul>
              <p>
                <Link href="https://supabase.com/docs">Docs Supabase</Link>
                {" · "}
                <Link href="https://nextjs.org/docs">Docs Next.js</Link>
              </p>
            </main>
          );
        }
        """,
    )

    write(
        WEBAPP / "app" / "globals.css",
        """
        :root { color-scheme: light dark; }
        html, body { margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; }
        a { color: inherit; }
        """,
    )

    # --- lib: supabase client --------------------------------------------------
    write(
        WEBAPP / "lib" / "supabaseClient.ts",
        """
        import { createClient } from "@supabase/supabase-js";

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn("⚠️  Missing Supabase env vars. Fill .env.local");
        }

        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        """,
    )

    # --- components: semplice header ------------------------------------------
    write(
        WEBAPP / "components" / "Header.tsx",
        """
        export default function Header() {
          return (
            <header style={{ padding: 16, borderBottom: "1px solid #ccc" }}>
              <strong>ICA Webapp</strong>
            </header>
          );
        }
        """,
    )

    # --- placeholder public ----------------------------------------------------
    (WEBAPP / "public").mkdir(parents=True, exist_ok=True)

    print("\n✅ Struttura Next.js + Supabase creata in webapp/")

if __name__ == "__main__":
    main()
