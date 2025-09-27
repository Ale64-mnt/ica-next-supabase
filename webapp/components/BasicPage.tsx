import { ReactNode } from "react";
import {getTranslations} from 'next-intl/server';
export type BasicPageProps = {
  title?: string;
  intro?: string;
  // rimosso: namespace?: string;
  children?: ReactNode;
  // opzionale: lo accettiamo per compat, ma non lo usiamo
  locale?: string;
};

export default async function BasicPage({
  title,
  intro,
  namespace,
  children,
}: BasicPageProps) {
  // riga rimossa: const t = namespace ? await getTranslations(namespace) : null;
  const resolvedTitle = title ?? (t ? t("title") : "");
  const resolvedIntro = intro ?? (t ? t("intro") : "");

  return (
    <main className="container" style={{ padding: "2rem" }}>
      {resolvedTitle && <h1>{resolvedTitle}</h1>}
      {resolvedIntro && <p>{resolvedIntro}</p>}
      {children}
    </main>
  );
}
