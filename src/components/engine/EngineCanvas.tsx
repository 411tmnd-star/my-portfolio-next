"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Group, type Material, Mesh, NoToneMapping, type OrthographicCamera, PCFShadowMap } from "three";
import { ACCENT, HANDOFF_START, useDock } from "@/components/hero/DockProgress";
import { MarkSlot } from "@/components/mark/MarkSlot";
import { READY_PROJECTS } from "@/content/projects";
import { ENGINE } from "@/content/site";
import { CAMERA_DISTANCE, CAMERA_TARGET, HUB, HUB_SCALE, STATION_SLOTS, VIEW_HEIGHT } from "./layout";
import { buildEngine, snapshot, type CardLine, type Pass } from "./model";
import { loadRobot } from "./robot";
import { IDLE_TIME, stateAt, wrap } from "./timeline";

/** Test and capture handle. Present only when the address asks for a fixed frame (?t=) or ?debug=1. */
export type EngineHandle = {
  ready: () => boolean;
  time: () => number;
  seek: (t: number) => void;
  snapshot: (t: number) => Record<string, number[]>;
  camera: () => number[];
  hub: (opacity: number) => void;
  png: (width: number, height: number, t: number, pass: Pass, background?: string) => string;
};
declare global {
  interface Window {
    __engine?: EngineHandle;
  }
}

export type EngineQuery = { t: number | null; pass: Pass; debug: boolean };

export function readQuery(search: string): EngineQuery {
  const q = new URLSearchParams(search);
  const t = Number(q.get("t"));
  const pass = q.get("pass");
  return {
    t: q.has("t") && Number.isFinite(t) ? t : null,
    pass: pass === "wire" || pass === "clay" ? pass : "final",
    debug: q.get("debug") === "1",
  };
}

const LINES = new Map<number, CardLine>(
  STATION_SLOTS.flatMap((slot, i) => {
    const p = READY_PROJECTS.find((x) => x.station === slot.id);
    return p ? [[i, { title: p.title, line: p.cardLine }] as [number, CardLine]] : [];
  }),
);

const K = CAMERA_DISTANCE / Math.sqrt(3);
const EYE: [number, number, number] = [CAMERA_TARGET[0] + K, CAMERA_TARGET[1] + K, CAMERA_TARGET[2] + K];

/** The locked isometric camera. Only its zoom follows the size of the frame. */
function LockedCamera() {
  const camera = useThree((s) => s.camera) as OrthographicCamera;
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    camera.position.set(...EYE);
    camera.up.set(0, 1, 0);
    camera.lookAt(...CAMERA_TARGET);
    camera.zoom = height / VIEW_HEIGHT;
    camera.near = 0.1;
    camera.far = CAMERA_DISTANCE * 2.5;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    invalidate();
  }, [camera, height, invalidate]);
  return null;
}

/** Parts of a mark more see-through than this (unlit segments) stay off the stage: overlapped they would give
 *  the final pass a silhouette that the clay and wire passes do not have. */
const SOLID = 0.5;

/** Multiplies the opacity of whatever is inside, for any mark, without knowing its materials. */
export function setGroupOpacity(group: Group, value: number): void {
  group.visible = value > 0.004;
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    for (const m of (Array.isArray(o.material) ? o.material : [o.material]) as Material[]) {
      m.userData.baseOpacity ??= m.opacity;
      m.transparent = true;
      m.opacity = m.userData.baseOpacity * value;
      o.visible = m.userData.baseOpacity >= SOLID;
    }
  });
}

/** The mark on the core. The loop raises and lowers it with the core, the dock hand-off fades it in. */
export function poseHub(group: Group, scale: number, opacity: number): void {
  group.scale.setScalar(Math.max(1e-4, scale) * HUB_SCALE);
  setGroupOpacity(group, scale > 2e-4 ? opacity : 0);
}

export function HubMark({ opacityRef, scaleRef, progressRef, reduced }: {
  opacityRef: React.RefObject<number>;
  scaleRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  reduced: boolean;
}) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    if (ref.current) poseHub(ref.current, scaleRef.current ?? 1, opacityRef.current ?? 0);
  });
  return (
    <group ref={ref} name="hub-mark" position={HUB} scale={HUB_SCALE}>
      <MarkSlot progressRef={progressRef} accent={ACCENT} reduced={reduced} />
    </group>
  );
}

function Scene({ query, visible, onFirstFrame, labels }: {
  query: EngineQuery;
  visible: boolean;
  onFirstFrame: () => void;
  labels: (opacity: number[], lit: number[]) => void;
}) {
  const { progressRef, handoffRef, hubPresenceRef, markHostRef, wakeRef, reduced } = useDock();
  const { gl, scene, camera, invalidate, size } = useThree();
  const engine = useMemo(() => {
    const css = typeof document === "undefined" ? "" : getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    return buildEngine({ lines: LINES, opening: ENGINE.opening, fontFamily: css ? `${css}, ui-monospace, monospace` : undefined });
  }, []);
  const time = useRef(query.t === null ? IDLE_TIME : query.t);
  const arrived = useRef(false);
  const hubScale = useRef(1);
  const hubOpacity = useRef(0);
  const hubOverride = useRef<number | null>(null);
  const robotReady = useRef(false);
  const told = useRef(false);

  useEffect(() => {
    let live = true;
    engine.setPass(query.pass);
    loadRobot()
      .then((robot) => {
        if (!live) return;
        engine.setRobot(robot);
        engine.setPass(query.pass);
        robotReady.current = true;
        invalidate();
      })
      .catch(() => {
        robotReady.current = true; // the carrier rides on its own
      });
    document.fonts?.ready.then(() => invalidate());
    return () => {
      live = false;
      engine.dispose();
    };
  }, [engine, invalidate, query.pass]);

  useEffect(() => {
    if (query.t === null && !query.debug) return;
    const at = (t: number) => {
      const s = stateAt(t);
      engine.pose(s);
      const hub = scene.getObjectByName("hub-mark") as Group | undefined;
      if (hub) poseHub(hub, s.hub, hubOverride.current ?? hubOpacity.current);
      return hub;
    };
    window.__engine = {
      ready: () => robotReady.current && scene.getObjectByName("hub-mark") !== undefined,
      time: () => time.current,
      seek: (t) => {
        time.current = t;
        invalidate();
      },
      snapshot: (t) => {
        const hub = at(t);
        hub?.updateWorldMatrix(true, true);
        return { ...snapshot(engine), "hub-mark": hub ? [...hub.matrixWorld.elements, hub.visible ? 1 : 0] : [] };
      },
      camera: () => [...camera.matrixWorld.elements, ...camera.projectionMatrix.elements],
      hub: (v) => {
        hubOverride.current = v;
        invalidate();
      },
      png: (width, height, t, pass, background) => {
        const ortho = camera as OrthographicCamera;
        const SS = pass === "wire" ? 1 : 2; // supersampled and scaled down, except one-pixel lines
        const saved = { w: size.width, h: size.height, pr: gl.getPixelRatio(), zoom: ortho.zoom, l: ortho.left, r: ortho.right, t: ortho.top, b: ortho.bottom };
        gl.setPixelRatio(1);
        gl.setSize(width * SS, height * SS, false);
        Object.assign(ortho, { left: -width / 2, right: width / 2, top: height / 2, bottom: -height / 2, zoom: height / VIEW_HEIGHT });
        ortho.updateProjectionMatrix();
        const hub = at(t) ?? scene;
        engine.setPass(pass); // after the pose: edges are taken from the posed geometry
        const swap = new Map<Mesh, Material | Material[]>();
        if (pass !== "final") {
          hub.traverse((o) => {
            if (!(o instanceof Mesh)) return;
            if (!o.visible) return;
            swap.set(o, o.material);
            o.material = engine.passMaterial(pass);
            if (pass === "wire") engine.addWire(o);
          });
        }
        gl.render(scene, camera);
        gl.render(scene, camera); // the second pass uses the shadow map of the first
        const out = document.createElement("canvas");
        out.width = width;
        out.height = height;
        const ctx = out.getContext("2d");
        if (ctx) {
          if (background) {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
          }
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(gl.domElement, 0, 0, width, height);
        }
        const url = out.toDataURL("image/png");
        for (const [o, m] of swap) o.material = m;
        engine.setPass(query.pass);
        gl.setPixelRatio(saved.pr);
        gl.setSize(saved.w, saved.h, false);
        Object.assign(ortho, { left: saved.l, right: saved.r, top: saved.t, bottom: saved.b, zoom: saved.zoom });
        ortho.updateProjectionMatrix();
        return url;
      },
    };
    return () => {
      delete window.__engine;
    };
  }, [camera, engine, gl, invalidate, query, scene, size]);

  // Frames are drawn on demand: on scroll, and one after another while the loop is running and on screen.
  useEffect(() => {
    wakeRef.current = () => invalidate();
    if (visible) invalidate();
    return () => {
      wakeRef.current = null;
    };
  }, [invalidate, visible, wakeRef]);

  useFrame((_, delta) => {
    const handoff = handoffRef.current ?? 0;
    if (query.t === null) {
      // The engine runs while the mark is docked. When the mark leaves, it plays on to the moment before the
      // core opens and waits there, assembled and closed.
      const before = time.current;
      const next = wrap(before + Math.min(delta, 0.1));
      const awake = (progressRef.current ?? 0) >= HANDOFF_START;
      const passesIdle = before <= IDLE_TIME && next >= IDLE_TIME && next - before < 1;
      time.current = !awake && passesIdle ? IDLE_TIME : next;
    }
    const s = stateAt(time.current);
    engine.pose(s);
    hubScale.current = s.hub;
    hubOpacity.current = hubOverride.current ?? (query.t === null ? handoff : 1);
    if (query.t === null) {
      // Cross-fade: the travelling mark leaves only while the stage's own mark is there to replace it.
      if (handoff <= 0) arrived.current = false;
      else if (handoff >= 1 && s.hub >= 1) arrived.current = true;
      hubPresenceRef.current = arrived.current ? 1 : Math.min(1, s.hub);
      if (markHostRef.current && handoff > 0) markHostRef.current.style.opacity = String(1 - handoff * hubPresenceRef.current);
    }
    labels(s.stations.map((x) => Math.min(1, x.scale)), s.stations.map((x) => x.lit));
    const running = query.t === null && ((progressRef.current ?? 0) >= HANDOFF_START || time.current !== IDLE_TIME);
    if (visible && running) invalidate();
    if (!told.current) {
      told.current = true;
      requestAnimationFrame(onFirstFrame);
    }
  });

  return (
    <>
      <LockedCamera />
      <primitive object={engine.root} />
      <HubMark opacityRef={hubOpacity} scaleRef={hubScale} progressRef={progressRef} reduced={reduced} />
    </>
  );
}

export default function EngineCanvas({ onFirstFrame, labels }: {
  onFirstFrame: () => void;
  labels: (opacity: number[], lit: number[]) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const query = useMemo(() => readQuery(window.location.search), []);

  useEffect(() => {
    if (!host.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(host.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="engine-canvas" data-testid="engine-canvas" aria-hidden="true">
      <Canvas
        orthographic
        flat
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 1.75]}
        camera={{ position: EYE, near: 0.1, far: CAMERA_DISTANCE * 2.5 }}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: query.t !== null || query.debug, toneMapping: NoToneMapping }}
        frameloop="demand"
      >
        <Scene query={query} visible={visible} onFirstFrame={onFirstFrame} labels={labels} />
      </Canvas>
    </div>
  );
}
