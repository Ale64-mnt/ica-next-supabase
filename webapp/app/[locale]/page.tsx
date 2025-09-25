import Link from "next/link";

export default function LocaleHome({ params }: { params: { locale: string } }) {
  const lang = params.locale;
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-4">
        {lang === "en" ? "Welcome" : "Benvenuto"}
      </h1>
      <p className="opacity-80 mb-6">
        {lang === "en"
          ? "Explore our latest articles."
          : "Scopri i nostri ultimi articoli."}
      </p>
      <div className="flex gap-4">
        <Link className="underline" href={`/${lang}/blog`}>Blog</Link>
        <Link className="underline" href={`/${lang}/news`}>News</Link>
      </div>
    </main>
  );
}
