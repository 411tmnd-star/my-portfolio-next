/**
 * §2 The Loop — placeholder.
 *
 * Reference-board decision: 12s total (not 5 equal beats) — ~2s assemble,
 * ~1.2s activate, 6.6s mascot journey, 2s teardown. Entrances overshoot,
 * exits don't. Ship two encodes (WebM/VP9 + MP4/H.264), muted/loop/
 * playsInline/poster, per §G. Swap the <video> below in once rendered.
 */
export default function Loop() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-panel)]"
        aria-label="411 loop video placeholder — assemble, activate, automate"
      >
        <div className="flex h-full items-center justify-center font-mono-brand text-sm text-[var(--color-muted)]">
          {/* Replace with:
          <video autoPlay muted loop playsInline poster="/loop-poster.jpg" className="h-full w-full object-cover">
            <source src="/loop.webm" type="video/webm" />
            <source src="/loop.mp4" type="video/mp4" />
          </video> */}
          loop video — 12s, not yet rendered
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center font-mono-brand text-xs uppercase tracking-wider text-[var(--color-muted)]">
        <span>Assemble</span>
        <span>Activate</span>
        <span>Automate</span>
      </div>
    </section>
  );
}
