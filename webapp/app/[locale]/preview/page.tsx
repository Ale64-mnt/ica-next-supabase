// webapp/app/[locale]/preview/page.tsx
import type { Metadata } from "next";
import EditorialPreview from "@/components/EditorialPreview";

export const metadata: Metadata = {
  title: "Anteprima editoriale",
  description: "Preview dello stile editoriale per contenuti News/Blog.",
};

export default function PreviewPage() {
  return <EditorialPreview />;
}
