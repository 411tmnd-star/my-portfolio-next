/**
 * §2 The Loop — a Blender reel of Michael's own work (agreed 2026-10-18).
 *
 * NOT rendered on the page until the reel exists: page.tsx only mounts this
 * when REEL.ready is true, so no placeholder ever ships.
 *
 * Encode two files from the same Blender render (muted, ~10–12s, seamless):
 *   public/reel/reel.webm  (VP9)    public/reel/reel.mp4  (H.264, yuv420p)
 *   public/reel/reel-poster.jpg  (first frame, also the reduced-motion view)
 */
export const REEL = {
  ready: false,
  webm: "/reel/reel.webm",
  mp4: "/reel/reel.mp4",
  poster: "/reel/reel-poster.jpg",
  captions: ["Model", "Rig", "Animate"],
  label: "Reel of Michael Ikhine's 3D and engineering work, rendered in Blender",
} as const;

export default function Loop() {
  return (
    <section id="reel" className="pb-[110px]">
      <div className="wrap">
        <span className="section-label">The Work</span>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster={REEL.poster}
            aria-label={REEL.label}
          >
            <source src={REEL.webm} type="video/webm" />
            <source src={REEL.mp4} type="video/mp4" />
          </video>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center font-mono-brand text-xs uppercase tracking-wider text-[var(--color-muted)]">
          {REEL.captions.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
