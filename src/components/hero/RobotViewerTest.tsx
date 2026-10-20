"use client";

import { Component, type ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* Viewer test for robot_v16.glb (Humanoid-Robot QA-003 close-out). Checks three things:
   it loads, the baked hello_sequence plays, and both thumbs sit right at a close camera.
   Query params (for scripted checks): view=full|head|left|right|right_back, markers=1, play=0, t=<seconds>, sample=1. */

const MODEL = "/models/robot_v16.glb";
const SAMPLE_FRAMES = [0, 20, 40, 60, 80]; // Blender frames at 30 fps
const SOURCE_FPS = 30;

type ViewName = "full" | "head" | "left" | "right" | "right_back";
type Info = { clips: { name: string; duration: number }[]; joints: number; skinnedMeshes: number };
type Sample = Record<string, Record<string, [number, number, number]>>;

const MARKS: [string, string][] = [
  ["DEF_Wrist", "#ffe14d"],
  ["DEF_Thumb_CMC", "#ff4d4d"],
  ["DEF_Index_MCP", "#35e0f2"],
  ["DEF_Little_MCP", "#ff4dd2"],
];
const SIDES = ["", "_L"];

class Boundary extends Component<{ children: ReactNode; onError: (m: string) => void }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  componentDidCatch(e: unknown) {
    this.props.onError(e instanceof Error ? e.message : String(e));
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}

function Robot(props: {
  view: ViewName;
  playing: boolean;
  markers: boolean;
  startTime: number | null;
  onInfo: (i: Info) => void;
  onSample: (s: Sample) => void;
  wantSample: boolean;
  sampleFrames: number[];
  onTime: (t: number) => void;
}) {
  const { view, playing, markers, startTime, onInfo, onSample, wantSample, sampleFrames, onTime } = props;
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions, names, mixer } = useAnimations(animations, group);
  const camera = useThree((s) => s.camera);
  const marks = useRef<Record<string, THREE.Mesh | null>>({});
  const v = useMemo(
    () => ({
      a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(),
      goal: new THREE.Vector3(), look: new THREE.Vector3(0, 0.9, 0), lookGoal: new THREE.Vector3(0, 0.9, 0),
    }),
    [],
  );

  const bonePositions = useCallback(() => {
    scene.updateMatrixWorld(true);
    const out: Record<string, [number, number, number]> = {};
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) {
        const p = new THREE.Vector3();
        o.getWorldPosition(p);
        out[o.name] = [p.x, p.y, p.z];
      }
    });
    return out;
  }, [scene]);

  useEffect(() => {
    let skinned = 0;
    let joints = 0;
    scene.traverse((o) => {
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
        o.frustumCulled = false; // skinned bounds are bind-pose; the wave leaves them
        skinned++;
      }
      if ((o as THREE.Bone).isBone) joints++;
    });
    onInfo({ clips: animations.map((a) => ({ name: a.name, duration: a.duration })), joints, skinnedMeshes: skinned });
  }, [scene, animations, onInfo]);

  useEffect(() => {
    const action = actions[names[0]];
    if (!action) return;
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    if (startTime != null) {
      action.time = startTime;
      mixer.update(0);
    }
    return () => {
      action.stop();
    };
  }, [actions, names, mixer, startTime]);

  useEffect(() => {
    mixer.timeScale = playing ? 1 : 0;
  }, [playing, mixer]);

  useEffect(() => {
    if (!wantSample) return;
    const action = actions[names[0]];
    if (!action) return;
    const out: Sample = {};
    for (const f of sampleFrames) {
      action.paused = true;
      action.time = f / SOURCE_FPS;
      mixer.update(0);
      out[String(f)] = bonePositions();
    }
    action.paused = false;
    onSample(out);
  }, [wantSample, sampleFrames, actions, names, mixer, bonePositions, onSample]);

  useFrame((_, dt) => {
    const at = (name: string, out: THREE.Vector3) => scene.getObjectByName(name)?.getWorldPosition(out);
    if (view === "full") {
      // The robot spans 0 to 2.34 m (head top 2.335 m, measured in Blender); at fov 35 this frames it with margin.
      v.goal.set(0, 1.17, 4.2);
      v.lookGoal.set(0, 1.17, 0);
    } else if (view === "head") {
      // Head spans 1.88 to 2.34 m; from 1.6 m away the vertical view is about 1 m, so it fits with the neck.
      v.goal.set(0, 2.1, 1.6);
      v.lookGoal.set(0, 2.1, 0.07);
    } else {
      const s = view === "left" ? "_L" : "";
      const w = at("DEF_Wrist" + s, v.a);
      const i = at("DEF_Index_MCP" + s, v.b);
      const l = at("DEF_Little_MCP" + s, v.c);
      if (w && i && l) {
        v.lookGoal.copy(w).add(i).add(l).multiplyScalar(1 / 3);
        // At the start of hello_sequence the right hand's fingers point away from the front camera.
        v.goal.copy(v.lookGoal).add(new THREE.Vector3(0, 0.02, view === "right_back" ? -0.4 : 0.4));
      }
    }
    const k = 1 - Math.exp(-dt * 5);
    camera.position.lerp(v.goal, k);
    v.look.lerp(v.lookGoal, k);
    camera.lookAt(v.look);
    if (markers) {
      for (const [bone] of MARKS) {
        for (const s of SIDES) {
          const m = marks.current[bone + s];
          if (m) at(bone + s, m.position);
        }
      }
    }
    const a = actions[names[0]];
    if (a) onTime(a.time);
  });

  return (
    <>
      <group ref={group}>
        <primitive object={scene} />
      </group>
      {MARKS.flatMap(([bone, color]) =>
        SIDES.map((s) => (
          <mesh key={bone + s} ref={(m) => { marks.current[bone + s] = m; }} visible={markers} renderOrder={10}>
            <sphereGeometry args={[0.007, 12, 12]} />
            <meshBasicMaterial color={color} depthTest={false} />
          </mesh>
        )),
      )}
    </>
  );
}

export default function RobotViewerTest() {
  const q = useMemo(() => new URLSearchParams(window.location.search), []);
  const [view, setView] = useState<ViewName>((q.get("view") as ViewName) || "full");
  const [markers, setMarkers] = useState(q.get("markers") === "1");
  const [playing, setPlaying] = useState(q.get("play") !== "0" && q.get("t") == null);
  const startTime = q.get("t") != null ? Number(q.get("t")) : null;
  const sampleFrames = useMemo(
    () => (q.get("frames") ? q.get("frames")!.split(",").map(Number) : SAMPLE_FRAMES),
    [q],
  );
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);
  const [sample, setSample] = useState<Sample | null>(null);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bump = () => setErrors((n) => n + 1);
    window.addEventListener("error", bump);
    window.addEventListener("unhandledrejection", bump);
    return () => {
      window.removeEventListener("error", bump);
      window.removeEventListener("unhandledrejection", bump);
    };
  }, []);

  const onTime = useCallback((t: number) => {
    if (timeRef.current) timeRef.current.textContent = t.toFixed(2);
  }, []);

  const status = error ? "error" : info ? "loaded" : "loading";
  const btn = (on: boolean) =>
    `rounded border px-3 py-1 text-xs ${on ? "border-[var(--color-cyan)] text-[var(--color-cyan)]" : "border-[var(--color-line)] text-[var(--color-silkscreen)]"}`;

  return (
    <main data-status={status} className="relative h-screen w-screen overflow-hidden bg-[var(--color-ground)]">
      <Boundary onError={setError}>
        <Canvas camera={{ fov: 35, near: 0.01, far: 60, position: [0, 1.05, 3.6] }} dpr={[1, 2]}>
          <hemisphereLight args={["#bcd4ff", "#2a2620", 1.1]} />
          <directionalLight position={[2, 3, 4]} intensity={2.2} />
          <directionalLight position={[-3, 1.5, 2]} intensity={0.9} color="#9fd8ff" />
          {/* Rim lights: the head and neck use near-black materials and vanish against the dark background without them. */}
          <directionalLight position={[0, 3, -4]} intensity={2.4} color="#9fd8ff" />
          <directionalLight position={[0, 4, 2]} intensity={1.4} />
          <Suspense fallback={null}>
            <Robot
              view={view}
              playing={playing}
              markers={markers}
              startTime={startTime}
              onInfo={setInfo}
              onSample={setSample}
              wantSample={q.get("sample") === "1"}
              sampleFrames={sampleFrames}
              onTime={onTime}
            />
          </Suspense>
        </Canvas>
      </Boundary>

      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2 text-xs text-[var(--color-silkscreen)]">
        <div className="pointer-events-auto flex flex-wrap gap-2">
          {(["full", "head", "left", "right", "right_back"] as ViewName[]).map((n) => (
            <button key={n} className={btn(view === n)} onClick={() => setView(n)}>
              {{ full: "Full body", head: "Head", left: "Left hand", right: "Right hand", right_back: "Right hand (back)" }[n]}
            </button>
          ))}
          <button className={btn(playing)} onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </button>
          <button className={btn(markers)} onClick={() => setMarkers((m) => !m)}>
            Bone markers
          </button>
        </div>
        <div className="rounded border border-[var(--color-line)] bg-[var(--color-panel)]/80 p-3 font-mono leading-5">
          <div>status: <span id="robot-status">{status}</span></div>
          {error && <div className="text-red-400">error: {error}</div>}
          {info && (
            <>
              <div>clip: {info.clips.map((c) => `${c.name} (${c.duration.toFixed(2)}s)`).join(", ") || "none"}</div>
              <div>joints: {info.joints} · skinned meshes: {info.skinnedMeshes}</div>
              <div>time: <span ref={timeRef}>0.00</span>s · runtime errors: {errors}</div>
              <div className="text-[var(--color-muted)]">
                markers: yellow wrist · red thumb CMC · cyan index MCP · magenta little MCP
              </div>
            </>
          )}
        </div>
      </div>
      {sample && <pre id="robot-sample" className="hidden">{JSON.stringify(sample)}</pre>}
    </main>
  );
}
