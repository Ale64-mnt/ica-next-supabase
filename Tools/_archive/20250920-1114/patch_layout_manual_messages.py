# Tools/patch_layout_manual_messages.py
# Sovrascrive app/[locale]/layout.tsx per importare i messaggi senza usare getMessages().
# Esecuzione: .\.venv\Scripts\python.exe Tools\patch_layout_manual_messages.py

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
LAYOUT = WEB / "app" / "[locale]" / "layout.tsx"

LAYOUT.parent.mkdir(parents=True, exist_ok=True)

content = r"""import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n/routing';
// import Nav from '@/components/Nav'; // scommenta se hai il componente

export const dynamic = 'force-static';

export default async function RootLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Valida locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Importa messaggi direttamente dal file JSON
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* <Nav /> */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
"""

# Backup leggero se esiste già
if LAYOUT.exists():
    LAYOUT.rename(LAYOUT.with_suffix(".tsx.bak"))

LAYOUT.write_text(content.replace("\r\n", "\n"), encoding="utf-8")
print(f"[OK] layout.tsx scritto: {LAYOUT}")
