export default function Footer() {
  return (
    <footer className="container-luxury py-10">
      <div className="flex flex-col gap-3 border-t border-ivory/10 pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>GoLa Handcrafted - Wooden & Leather Handbags</p>
          <p>
            Site by{" "}
            <a
              href="https://www.nrgtrw.com"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-ivory"
            >
              nrgtrw.com
            </a>
          </p>
        </div>
        <p>Available by inquiry only. Crafted in limited quantities.</p>
      </div>
    </footer>
  );
}
