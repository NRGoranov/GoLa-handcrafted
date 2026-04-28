type FooterCopy = {
  brandLine: string;
  siteBy: string;
  availabilityLine: string;
};

export default function Footer({ copy }: { copy: FooterCopy }) {
  return (
    <footer className="container-luxury py-10">
      <div className="flex flex-col gap-3 border-t border-ivory/10 pt-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>{copy.brandLine}</p>
          <p>
            {copy.siteBy}{" "}
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
        <p>{copy.availabilityLine}</p>
      </div>
    </footer>
  );
}
