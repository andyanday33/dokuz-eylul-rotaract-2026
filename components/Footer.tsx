import { getDictionary } from "@/i18n/dictionaries";
import { Grain } from "./Editorial";

const CREDIT_URL = "https://anday.dev";

export const Footer = async () => {
  const { footer } = await getDictionary();
  // The link sits mid-sentence, and the two languages put it in different
  // places — so the string carries a `{link}` slot rather than being split
  // into a fixed before/after pair.
  const [before, after] = footer.credit.split("{link}");

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-16 sm:py-20">
        <p className="display-4 font-editorial max-w-4xl italic leading-[1.05]">
          {footer.tagline}
        </p>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/15 pt-6 text-sm text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {before}
            <a
              href={CREDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              anday.dev
            </a>
            {after}
          </p>
          <p className="eyebrow text-paper/45">{footer.motto}</p>
        </div>
      </div>
    </footer>
  );
};
