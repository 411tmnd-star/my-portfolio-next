export default function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="text-2xl font-semibold text-[var(--color-silkscreen)]">About</h2>
      <p className="mt-4 text-[var(--color-muted)]">
        Electrical Engineering student, web developer, UI/UX and 3D designer.
        Every trace on this page routes at 45°, never 90° — the same rule
        real PCB layouts follow, because right angles cost more board area
        and route length, not signal integrity. That is the kind of detail
        this page is built to prove.
      </p>
    </section>
  );
}
