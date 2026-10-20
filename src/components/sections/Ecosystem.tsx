"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ECOSYSTEM } from "@/content/site";

/**
 * §4 Ecosystem — the honest 3-layer stack (Physical → System → Interface).
 * A layered diagram, not a picture of one: layers are HTML so text reflows
 * and stays selectable; only the connectors are SVG. The assembly on arrival
 * is an enhancement (.js-eco) — without JS every layer is already drawn.
 * Phase 2 spends the motion budget here ("04 is where you win").
 */
export default function Ecosystem() {
  const ecoRef = useRef<HTMLDivElement>(null);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const eco = ecoRef.current;
    if (!eco || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(eco.querySelectorAll<HTMLElement>(".eco-layer"));
    setEnhanced(true);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = layers.indexOf(e.target as HTMLElement);
          (e.target as HTMLElement).style.transitionDelay = `${i * 0.11}s`;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    layers.forEach((l) => io.observe(l));
    const safety = window.setTimeout(() => layers.forEach((l) => l.classList.add("in")), 2500);
    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, []);

  return (
    <section id="architecture">
      <div className="wrap">
        <span className="section-label">{ECOSYSTEM.label}</span>
        <h2 className="section-title">{ECOSYSTEM.title}</h2>
        <p className="section-sub">{ECOSYSTEM.sub}</p>

        <div ref={ecoRef} className={`mb-[46px] ${enhanced ? "js-eco" : ""}`}>
          {ECOSYSTEM.layers.map((layer) => (
            <Fragment key={layer.num}>
              <div className="eco-layer relative rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] px-7 py-[26px] transition duration-[600ms] hover:border-[rgb(53_224_242/0.28)]">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-md border border-[var(--color-line)] px-[9px] py-1 font-mono-brand text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {layer.num}
                  </span>
                  <h3 className="m-0 text-[19px] font-semibold tracking-tight">{layer.name}</h3>
                  <span className={`chip ml-auto ${layer.status === "live" ? "chip-live" : "chip-plan"}`}>{layer.statusLabel}</span>
                </div>
                <p className="mb-[18px] max-w-[660px] text-[14.5px] leading-[1.7] text-[var(--color-muted)]">{layer.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.nodes.map((n) => (
                    <span key={n.label} className={`pill ${n.key ? "pill-key" : ""}`}>
                      {n.label}
                    </span>
                  ))}
                </div>
              </div>
              {layer.linkBelow && (
                <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2.5 text-[var(--color-muted)]">
                  <svg className="col-start-2 mx-auto block" width="18" height="46" viewBox="0 0 18 46" aria-hidden="true" focusable="false">
                    <path d="M9 0 V34" stroke="rgba(230,237,243,0.18)" strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
                    <path d="M9 44 L4 34 H14 Z" fill="var(--color-cyan)" />
                  </svg>
                  <span className="col-start-3 justify-self-start pl-3.5 font-mono-brand text-[11px] uppercase tracking-[0.12em]">
                    {layer.linkBelow}
                  </span>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <p className="mb-[60px] font-mono-brand text-[11.5px] leading-[1.7] text-[var(--color-muted)]">
          {ECOSYSTEM.foot.before}
          <Link href={ECOSYSTEM.foot.href} className="text-[var(--color-cyan)] hover:underline">
            {ECOSYSTEM.foot.linkLabel}
          </Link>
          {ECOSYSTEM.foot.after}
        </p>
      </div>
    </section>
  );
}
