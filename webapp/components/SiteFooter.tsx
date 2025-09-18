// webapp/components/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600">
        © {new Date().getFullYear()} Edunovà — Tutti i diritti riservati.
      </div>
    </footer>
  );
}
