import type { ReactNode } from "react";

// Definiamo un tipo per la funzione 't' per maggiore sicurezza
type TFunction = (key: string) => string;

type BasicPageProps = {
  children: ReactNode;
  t: TFunction; // 't' è ora una prop obbligatoria
  namespace: string;
  title?: string;
  intro?: string;
};

export default function BasicPage({
  t,
  title,
  intro,
  children,
  namespace
}: BasicPageProps) {

  // Ora 't' viene ricevuto come prop e usato in sicurezza
  const resolvedTitle = title ?? t("title");
  const resolvedIntro = intro ?? t("intro");

  return (
    <main className="container mx-auto px-4 py-8">
      <header>
        <h1 className="text-4xl font-bold mb-2">{resolvedTitle}</h1>
        <p className="text-lg text-gray-600">{resolvedIntro}</p>
      </header>
      <div className="mt-8">
        {children}
      </div>
    </main>
  );
}