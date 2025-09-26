"use client";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

export type BasicPageProps = {
  title?: string;
  intro?: string;
  namespace?: string;
  children?: ReactNode;
  // opzionale: lo accettiamo per compat, ma non lo usiamo
  locale?: string;
};

export default function BasicPage({
  title,
  intro,
  namespace,
  children,
}: BasicPageProps) {
  const t = namespace ? useTranslations(namespace) : null;
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
