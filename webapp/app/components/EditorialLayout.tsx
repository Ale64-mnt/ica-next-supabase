// webapp/components/EditorialLayout.tsx
import type { ReactNode } from "react";

export default function EditorialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {children}
    </div>
  );
}
