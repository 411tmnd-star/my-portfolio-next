"use client";

import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Box3, Vector3 } from "three";

/** Self-hosted decoders: Draco from /draco/, meshopt from the bundle. */
function Model({ src, onReady }: { src: string; onReady: () => void }) {
  const { scene } = useGLTF(src, "/draco/", true);
  const invalidate = useThree((s) => s.invalidate);
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const k = 2 / size.y;
    return { scale: k, position: new Vector3(-centre.x * k, -centre.y * k, -centre.z * k) };
  }, [scene]);
  useEffect(() => {
    invalidate();
    const raf = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, onReady]);
  return <primitive object={scene} scale={fit.scale} position={fit.position} />;
}

export default function GlbViewer({ src, label, onReady }: { src: string; label: string; onReady: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="glb-viewer" role="img" aria-label={label}>
      <Canvas camera={{ position: [1.15, 0.35, 3.1], fov: 40 }} dpr={[1, 1.75]} frameloop="demand" gl={{ alpha: true, preserveDrawingBuffer: true }}>
        <hemisphereLight args={["#DCE7F0", "#1A2027", 1.6]} />
        <directionalLight position={[2.5, 4, 3]} intensity={2.4} />
        <directionalLight position={[-3, 2, -4]} intensity={2.2} color="#8FD3E6" />
        <Suspense fallback={null}>
          <Model src={src} onReady={onReady} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.9} maxPolarAngle={1.75} />
      </Canvas>
    </div>
  );
}
