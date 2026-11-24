"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { ACCENT, useDock } from "./DockProgress";
import { HERO_CAMERA } from "./dockMath";
import { Hero3DScene } from "./Hero3DScene";

/** Loaded after first paint. Covers the flat mark once its first frame is drawn. */
export default function HeroCanvas({ onReady }: { onReady: () => void }) {
  const { progressRef, reduced } = useDock();
  const [running, setRunning] = useState(true);

  // The mark hands over to the stage at the end of the hero; no need to keep drawing it after that.
  useEffect(() => {
    const id = window.setInterval(() => setRunning((progressRef.current ?? 0) < 1), 250);
    return () => clearInterval(id);
  }, [progressRef]);

  return (
    <Canvas
      camera={{ position: [0, 0, HERO_CAMERA.z], fov: HERO_CAMERA.fov }}
      dpr={[1, 2]}
      resize={{ offsetSize: true }} // the host is scaled while docking; measure the box before its transform
      gl={{ alpha: true, antialias: true }}
      frameloop={running ? "always" : "never"}
      onCreated={() => requestAnimationFrame(onReady)}
    >
      <Hero3DScene progressRef={progressRef} accent={ACCENT} reduced={reduced} />
    </Canvas>
  );
}
