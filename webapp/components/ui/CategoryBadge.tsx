import React from "react";

export default function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md bg-orange-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}
