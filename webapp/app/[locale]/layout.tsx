import Nav from "@/components/Nav";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body className="antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
