"use client";

import { Fragment, useEffect, useRef } from "react";

const ICONS: Record<string, React.ReactNode> = {
  sensor: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M5 12q2.2-4 3.5 0t3.5 0 3.5 0 3.5 0" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
    </>
  ),
  ml: (
    <>
      <circle cx="6" cy="8" r="2" />
      <circle cx="6" cy="17" r="2" />
      <circle cx="18" cy="12.5" r="2" />
      <circle cx="12" cy="5" r="1.6" />
      <path d="M8 8.8l8 3M8 16.2l8-3M7.2 6.6l3.5-1" />
    </>
  ),
  antenna: (
    <>
      <path d="M12 21V11" />
      <circle cx="12" cy="8.5" r="1.8" />
      <path d="M7.5 12a6 6 0 0 1 0-7M16.5 5a6 6 0 0 1 0 7" />
      <path d="M4.5 14.5a10 10 0 0 1 0-12M19.5 2.5a10 10 0 0 1 0 12" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 8h18M8 18v2h8v-2" />
      <path d="M7.5 14.5l3-3 2.5 2.5 3.5-4" />
    </>
  ),
};

type Node = { step: string; name: string; sub: string; icon: string };

/**
 * Sensor → screen pipeline. The travelling pulse is pure CSS (globals.css),
 * so it runs with JS disabled; JS only pauses it while off-screen or hidden.
 * The rail turns vertical under 820px — same mechanism, different axis.
 */
export default function Pipeline({ nodes }: { nodes: readonly Node[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pipe = ref.current;
    if (!pipe || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => pipe.classList.toggle("paused", !entries[0].isIntersecting), { threshold: 0 });
    io.observe(pipe);
    const onVis = () => document.hidden && pipe.classList.add("paused");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={ref} className="pipe flex flex-col items-stretch min-[821px]:flex-row">
      {nodes.map((n, i) => (
        <Fragment key={n.step}>
          <div className="flex min-w-0 flex-1 basis-0 items-center gap-3.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3.5 text-left min-[821px]:block min-[821px]:px-2.5 min-[821px]:pb-4 min-[821px]:pt-[18px] min-[821px]:text-center">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className={`block h-[30px] w-[30px] flex-none fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.6] min-[821px]:mx-auto min-[821px]:mb-2.5 ${i === nodes.length - 1 ? "text-[var(--color-cyan)]" : "text-[var(--color-copper-highlight)]"}`}
            >
              {ICONS[n.icon]}
            </svg>
            <div className="min-w-0">
              <span className="mb-[5px] block font-mono-brand text-[10px] tracking-[0.13em] text-[var(--color-muted)]">{n.step}</span>
              <span className="mb-[5px] block font-mono-brand text-xs leading-[1.35]">{n.name}</span>
              <span className="block text-[11px] leading-[1.45] text-[var(--color-muted)]">{n.sub}</span>
            </div>
          </div>
          {i < nodes.length - 1 && (
            <div
              aria-hidden="true"
              className="pipe-link ml-[30px] h-[34px] w-0.5 flex-none self-start min-[821px]:ml-0 min-[821px]:h-0.5 min-[821px]:w-[54px] min-[821px]:self-center"
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
