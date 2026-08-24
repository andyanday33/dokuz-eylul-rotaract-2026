export const Footer = () => {
  return (
    <footer className="mx-auto flex max-w-[1240px] flex-col gap-3 px-6 py-12 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
      <p>
        © {new Date().getFullYear()} Rotaract Kulübü.{" "}
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
      <p className="eyebrow">Kişisel çıkarların ötesinde hizmet</p>
    </footer>
  );
};
