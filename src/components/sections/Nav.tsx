const LINKS = [
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#proof", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#about", label: "About" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[var(--color-ground)]/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono-brand text-sm tracking-widest text-[var(--color-silkscreen)]">
          411
        </a>
        <nav className="hidden gap-8 text-sm text-[var(--color-muted)] md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-[var(--color-silkscreen)]">
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="rounded-full bg-[var(--color-silkscreen)] px-4 py-2 text-sm font-medium text-[var(--color-ground)] transition-opacity hover:opacity-90"
        >
          Get in touch
        </a>
      </div>
    </header>
  );
}
