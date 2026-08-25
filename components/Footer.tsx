import { Grain } from "./Editorial";

export const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <Grain variant="ink" />

      <div className="wrapper relative z-10 py-16 sm:py-20">
        <p className="font-editorial max-w-4xl text-[9vw] italic leading-[1.05] sm:text-5xl lg:text-6xl">
          Hizmetle gelen dostluk.
        </p>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/15 pt-6 text-sm text-paper/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Dokuz Eylül Rotaract Kulübü.{" "}
            <a
              href="https://anday.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              anday.dev
            </a>{" "}
            tarafından geliştirildi.
          </p>
          <p className="eyebrow text-paper/45">
            Kişisel çıkarların ötesinde hizmet
          </p>
        </div>
      </div>
    </footer>
  );
};
