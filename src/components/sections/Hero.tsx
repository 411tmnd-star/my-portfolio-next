"use client";

import { useRef } from "react";
import { HERO } from "@/content/site";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import HeroRobotSvg from "@/components/hero/HeroRobotSvg";
import { useGreeting } from "@/components/hero/useGreeting";

/**
 * §1 Hero — "Michael Ikhine, hire me", with 411 as what he's building.
 *
 * The stage on the right is where the 3D humanoid lands in step 3
 * (docs/REFINEMENT-PLAN.md). Until then it holds the live site's approved
 * SVG greeting, so the Next build matches production before the switch.
 * Mobile: the robot sits above the copy and stays small, so "Start a
 * project" is above the fold. Conversion outranks spectacle.
 */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  useGreeting(heroRef);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="hero relative overflow-hidden px-[max(16px,6vw)] pb-11 pt-6 sm:pb-14 sm:pt-11 lg:pb-[70px] lg:pt-[90px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[150px] -top-[200px] h-[500px] w-[500px] bg-[radial-gradient(circle,rgb(53_224_242/0.12),transparent_70%)]"
      />
      <div className="mx-auto grid max-w-[1100px] items-center gap-2.5 sm:gap-[18px] lg:grid-cols-[1.12fr_0.88fr] lg:gap-11">
        <div>
          <span className="hero-reveal mb-3.5 block font-mono-brand text-[12.5px] uppercase tracking-[0.12em] text-[var(--color-cyan)] sm:mb-5">
            {HERO.eyebrow}
          </span>
          <h1 className="hero-reveal mb-4 max-w-[880px] text-[clamp(30px,8.2vw,36px)] font-bold leading-[1.15] tracking-tight [transition-delay:.08s] sm:mb-5 sm:text-[clamp(36px,5.6vw,54px)]">
            {HERO.titleBefore}
            <span className="text-[var(--color-cyan)]">{HERO.titleAccent}</span>
            {HERO.titleAfter}
          </h1>
          <p className="hero-reveal mb-[26px] max-w-[680px] text-[15.5px] text-[var(--color-muted)] [transition-delay:.16s] sm:mb-[34px] sm:text-[16.5px]">
            {HERO.sub}
          </p>
          <div className="hero-reveal flex flex-wrap gap-3.5 [transition-delay:.24s]">
            <WhatsAppButton href={HERO.primary.href}>{HERO.primary.label}</WhatsAppButton>
            <a href={HERO.secondary.href} className="btn btn-ghost">
              {HERO.secondary.label}
            </a>
          </div>
        </div>

        <div id="hero-stage" className="order-first flex items-center justify-start lg:order-none lg:justify-center">
          <HeroRobotSvg />
        </div>
      </div>
    </section>
  );
}
