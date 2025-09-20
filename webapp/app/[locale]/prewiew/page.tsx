// webapp/app/[locale]/preview/page.tsx
import type { Metadata } from "next";
import EditorialPreview from "@/components/EditorialPreview";

type Props = {
  params: { locale: string };
};

export const metadata: Metadata = {
  title: "Anteprima editoriale",
  description: "Preview dello stile editoriale per contenuti News/Blog.",
};

export default function PreviewPage(_props: Props) {
  return <EditorialPreview />;
}
