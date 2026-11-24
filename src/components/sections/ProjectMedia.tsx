"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDock } from "@/components/hero/DockProgress";
import type { Media } from "@/content/projects";

const GlbViewer = dynamic(() => import("@/components/three/GlbViewer"), { ssr: false });

/** One picture, one moving picture, or a live model on desktop. The still is always there underneath. */
export default function ProjectMedia({ media }: { media: Media }) {
  const { mode, reduced } = useDock();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const onReady = useCallback(() => setDrawn(true), []);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "250px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const still = media.kind === "model" ? media.poster : media.src;
  const moving = media.kind === "image" && media.motion && near && !reduced && mode !== "checking" ? media.motion : null;
  return (
    <figure className="project-media">
      <div ref={ref} className="project-frame" style={{ aspectRatio: `${media.width} / ${media.height}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={moving ?? still}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
          style={{ opacity: drawn ? 0 : 1 }}
        />
        {media.kind === "model" && mode === "live" && near && <GlbViewer src={media.src} label={media.alt} onReady={onReady} />}
      </div>
      <figcaption>{media.caption}</figcaption>
    </figure>
  );
}
