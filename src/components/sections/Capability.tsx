"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CAPABILITY } from "@/content/site";

/**
 * §2 Capability — scroll-driven *emphasis*, not reveal. Every panel is fully
 * readable at rest; JS only adds .js-cap and marks the panel in the middle
 * band of the viewport. Reduced motion or no IntersectionObserver: nothing
 * is dimmed.
 */
export default function Capability() {
  const panelsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const root = panelsRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const panels = Array.from(root.querySelectorAll<HTMLElement>(".cap-panel"));
    const io = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
        }
        if (best) {
          const idx = panels.indexOf(best.target as HTMLElement);
          if (idx > -1) setActive(idx);
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    panels.forEach((p) => io.observe(p));
    setEnhanced(true);
    return () => io.disconnect();
  }, []);

  return (
    <section id="capability" className="pt-6">
      <div className="wrap">
        <span className="section-label">{CAPABILITY.label}</span>
        <h2 className="section-title">{CAPABILITY.title}</h2>
        <p className="section-sub">{CAPABILITY.sub}</p>

        <div className="mb-[110px] grid items-start gap-0 md:grid-cols-[190px_1fr] md:gap-[60px]">
          <ol
            aria-hidden="true"
            className="sticky top-[calc(var(--header-height)+48px)] m-0 hidden list-none border-l border-[var(--color-line)] py-0 pl-[18px] md:block"
          >
            {CAPABILITY.panels.map((p, i) => {
              const on = enhanced && i === active;
              return (
                <li
                  key={p.name}
                  className={`relative py-[9px] font-mono-brand text-[12.5px] uppercase tracking-[0.11em] transition-colors duration-300 ${on ? "text-[var(--color-cyan)]" : "text-[var(--color-muted)]"}`}
                >
                  <span
                    className={`absolute -left-[22px] top-1/2 h-px transition-all duration-300 ${on ? "w-3.5 bg-[var(--color-cyan)]" : "w-[7px] bg-[var(--color-line)]"}`}
                  />
                  {p.name}
                </li>
              );
            })}
          </ol>

          <div ref={panelsRef} className={enhanced ? "js-cap" : ""}>
            {CAPABILITY.panels.map((p, i) => (
              <article key={p.name} className={`cap-panel relative pb-[62px] last:pb-0 md:pb-24 ${enhanced && i === active ? "on" : ""}`}>
                <span className="mb-2.5 block font-mono-brand text-xs tracking-[0.12em] text-[var(--color-muted)]">
                  {String(i + 1).padStart(2, "0")} / {String(CAPABILITY.panels.length).padStart(2, "0")}
                </span>
                <h3 className="cap-name m-0 mb-1.5 text-[clamp(30px,4.2vw,46px)] font-bold leading-[1.1] tracking-tight transition-colors duration-500">
                  {p.name}
                </h3>
                <div className="cap-rule my-4 mb-5 h-0.5 w-[60px] rounded-sm bg-[var(--color-cyan)] transition-all duration-500" />
                <p className="mb-5 max-w-[560px] text-[15.5px] text-[var(--color-muted)]">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span key={s} className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-[11px] py-[5px] font-mono-brand text-[11.5px] text-[var(--color-muted)]">
                      {s}
                    </span>
                  ))}
                </div>
                {p.note && (
                  <p className="mt-5 max-w-[560px] border-l-2 border-[var(--color-copper)] py-2 pl-3 font-mono-brand text-xs leading-[1.65] text-[var(--color-muted)]">
                    {p.note.before}
                    {p.note.href.startsWith("/") ? (
                      <Link href={p.note.href} className="text-[var(--color-cyan)] hover:underline">
                        {p.note.linkLabel}
                      </Link>
                    ) : (
                      <a href={p.note.href} className="text-[var(--color-cyan)] hover:underline">
                        {p.note.linkLabel}
                      </a>
                    )}
                    {p.note.after}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
