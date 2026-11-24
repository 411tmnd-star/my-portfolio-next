"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useAfterPaint, useDock } from "./DockProgress";

const BadgeCanvas = dynamic(() => import("./BadgeCanvas"), { ssr: false });

/**
 * The fixed corner badge. It appears only after the stage has left the screen: the hero's scroll handler
 * writes its opacity through badgeHostRef, so there is still one listener. Not rendered at all outside the
 * live mode, like the 3D mark itself.
 */
export function DockedMarkBadge() {
  const { badgeHostRef, mode } = useDock();
  const hoverRef = useRef(false);
  const after = useAfterPaint(mode === "live");

  if (mode !== "live") return null;
  return (
    <div
      ref={badgeHostRef}
      style={{ opacity: 0 }}
      className="docked-badge"
      aria-hidden="true"
      data-testid="docked-mark-badge"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      {after && <BadgeCanvas hoverRef={hoverRef} />}
    </div>
  );
}
