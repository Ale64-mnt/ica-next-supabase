export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <nav className="flex gap-5 text-sm">
            <a href="/privacy" className="hover:underline">Privacy</a>
            <a href="/contatti" className="hover:underline">Contatti</a>
            <a href="/about" className="hover:underline">Chi siamo</a>
          </nav>
          <p className="text-sm">&copy; {new Date().getFullYear()} Edunovà – Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
