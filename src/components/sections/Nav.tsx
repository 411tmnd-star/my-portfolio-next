"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/content/site";

function StatusDot({ inMenu = false }: { inMenu?: boolean }) {
  return (
    <span
      className={
        inMenu
          ? "mt-1 inline-flex w-full items-center gap-2 border-t border-[var(--color-line)] pt-3.5 font-mono-brand text-[11.5px] text-[var(--color-muted)]"
          : "hidden items-center gap-2 whitespace-nowrap rounded-full border border-[var(--color-line)] px-3 py-1.5 font-mono-brand text-[11.5px] text-[var(--color-muted)] md:inline-flex"
      }
    >
      <span className="h-[7px] w-[7px] rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_var(--color-cyan)]" />
      Available for projects
    </span>
  );
}

/**
 * Sticky header with an accessible mobile drawer — same wiring as the live
 * site: aria-expanded/aria-controls, closes on link, outside click, Escape,
 * and on resize past the breakpoint. Keeps --header-height in sync for
 * scroll-padding and sticky offsets.
 */
export default function Nav({ variant = "home" }: { variant?: "home" | "sub" }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const syncHeight = () => {
      if (navRef.current) {
        document.documentElement.style.setProperty("--header-height", `${navRef.current.offsetHeight}px`);
      }
      if (window.innerWidth > 760) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) setOpen(false);
    };
    syncHeight();
    window.addEventListener("resize", syncHeight);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("resize", syncHeight);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-ground)]/90 backdrop-blur-md">
      <nav ref={navRef} aria-label="Main Navigation" className="flex items-center justify-between px-[max(16px,6vw)] py-4">
        <Link href="/" className="flex flex-col leading-tight no-underline">
          <span className="text-[22px] font-bold tracking-tight text-[var(--color-cyan)]">411</span>
          <span className="font-mono-brand text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
            by Michael Ikhine
          </span>
        </Link>

        {variant === "sub" ? (
          <Link href="/" className="font-mono-brand text-[12.5px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-cyan)]">
            ← Back to Portfolio
          </Link>
        ) : (
          <>
            <div className="hidden gap-[26px] text-[13.5px] md:flex">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-cyan)]">
                  {l.label}
                </a>
              ))}
            </div>

            <StatusDot />

            <button
              ref={btnRef}
              type="button"
              className="flex flex-col gap-[5px] p-1.5 md:hidden"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              aria-controls="mobileMenu"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="h-0.5 w-[22px] bg-[var(--color-silkscreen)]" />
              <span className="h-0.5 w-[22px] bg-[var(--color-silkscreen)]" />
              <span className="h-0.5 w-[22px] bg-[var(--color-silkscreen)]" />
            </button>
          </>
        )}
      </nav>

      {variant === "home" && (
        <div
          id="mobileMenu"
          ref={menuRef}
          className={`fixed left-0 top-[var(--header-height)] z-40 w-full flex-col gap-4 border-b border-[var(--color-line)] bg-[var(--color-panel-2)] px-[max(16px,6vw)] py-5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] md:hidden ${open ? "flex" : "hidden"}`}
        >
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={close} className="text-[15px] font-medium text-[var(--color-silkscreen)]">
              {l.label}
            </a>
          ))}
          <StatusDot inMenu />
        </div>
      )}
    </header>
  );
}
