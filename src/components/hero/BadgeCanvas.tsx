"use client";

import { Canvas } from "@react-three/fiber";
import { type RefObject, useEffect, useState } from "react";
import { ACCENT, useDock } from "./DockProgress";
import { BadgeScene } from "./BadgeScene";

export default function BadgeCanvas({ hoverRef }: { hoverRef: RefObject<boolean> }) {
  const { badgeHostRef, progressRef, reduced } = useDock();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setRunning(badgeHostRef.current?.style.opacity === "1"), 250);
    return () => clearInterval(id);
  }, [badgeHostRef]);

  return (
    <Canvas camera={{ position: [0, 0, 3.4], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true }} frameloop={running ? "always" : "demand"}>
      <BadgeScene hoverRef={hoverRef} progressRef={progressRef} accent={ACCENT} reduced={reduced} />
    </Canvas>
  );
}
