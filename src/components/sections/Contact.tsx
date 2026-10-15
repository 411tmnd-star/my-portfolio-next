export default function Contact() {
  return (
    <footer id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="text-2xl font-semibold text-[var(--color-silkscreen)]">
        Let&apos;s build something.
      </h2>
      <a
        href="mailto:411.tmnd@gmail.com"
        className="mt-6 inline-block rounded-full bg-[var(--color-silkscreen)] px-6 py-3 text-sm font-medium text-[var(--color-ground)]"
      >
        Get in touch
      </a>
      <p className="mt-10 text-xs text-[var(--color-muted)]">
        Built with open KiCad libraries (CC-BY-SA 4.0, KiCad exception) and
        CC0 assets. Fonts: Space Grotesk &amp; JetBrains Mono (OFL).
      </p>
    </footer>
  );
}
