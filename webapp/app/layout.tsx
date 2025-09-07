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
