import ReactThreeTestRenderer from "@react-three/test-renderer";
import { createRef, type RefObject } from "react";
import { Box3, type Object3D, Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { ALL_SEGMENTS, MARK_DIGITS, segmentsFor } from "@/lib/sevenSegment";
import { SegmentMark } from "@/components/mark/SegmentMark";

const num = (v: number) => ({ current: v }) as RefObject<number>;

// The swap the slot exists for: same factory, ACTIVE_MARK set to a stub.
vi.mock("@/components/mark/MarkSlot", async (original) => {
  const real = await original<typeof import("@/components/mark/MarkSlot")>();
  const { createMarkSlot } = await import("@/components/mark/createMarkSlot");
  const Stub = () => (
    <mesh name="stub-mark">
      <boxGeometry args={[2.1, 1, 0.3]} />
      <meshBasicMaterial />
    </mesh>
  );
  const MARKS = { ...real.MARKS, stub: Stub };
  const ACTIVE_MARK = "stub" as const;
  return { ...real, MARKS, ACTIVE_MARK, MarkSlot: createMarkSlot(MARKS, ACTIVE_MARK) };
});

async function names(element: React.ReactElement): Promise<string[]> {
  const r = await ReactThreeTestRenderer.create(element);
  await r.advanceFrames(2, 0.016);
  const out: string[] = [];
  (r.scene.instance as unknown as Object3D).traverse((o) => o.name && out.push(o.name));
  await r.unmount();
  return out;
}

describe("mark slot", () => {
  it("renders whichever mark is active in the hero, on the hub and in the badge", async () => {
    const { Hero3DScene } = await import("@/components/hero/Hero3DScene");
    const { HubMark } = await import("@/components/engine/EngineCanvas");
    const { BadgeScene } = await import("@/components/hero/BadgeScene");
    const props = { progressRef: num(0), accent: "#E08030", reduced: false };
    const all = [
      await names(<Hero3DScene {...props} />),
      await names(<HubMark opacityRef={num(1)} scaleRef={num(1)} progressRef={num(1)} reduced={false} />),
      await names(<BadgeScene {...props} hoverRef={createRef() as never} />),
    ];
    for (const list of all) expect(list).toEqual(expect.arrayContaining(["mark-slot", "stub-mark"]));
  });

  it("swings the hero and badge marks and never turns them far enough to read backwards", async () => {
    const { Hero3DScene } = await import("@/components/hero/Hero3DScene");
    const { BadgeScene } = await import("@/components/hero/BadgeScene");
    const props = { accent: "#E08030", reduced: false };
    const scenes = [
      ...[0, 0.5, 1].map((p) => <Hero3DScene key={p} {...props} progressRef={num(p)} />),
      <BadgeScene key="badge" {...props} progressRef={num(1)} hoverRef={createRef() as never} />,
    ];
    const ranges: number[] = [];
    for (const scene of scenes) {
      const r = await ReactThreeTestRenderer.create(scene);
      const mark = (r.scene.instance as unknown as Object3D).getObjectByName("mark-slot") as Object3D;
      const facing: number[] = [];
      const yaws: number[] = [];
      for (let i = 0; i < 400; i++) {
        await r.advanceFrames(1, 0.1); // 40 s in all, about six hero swings
        mark.updateWorldMatrix(true, false);
        const front = new Vector3(0, 0, 1).transformDirection(mark.matrixWorld);
        facing.push(front.z);
        yaws.push(Math.atan2(front.x, front.z));
      }
      // cos 60: digits are still clearly legible. A full turn would reach -1.
      expect(Math.min(...facing)).toBeGreaterThan(0.5);
      ranges.push(Math.max(...yaws) - Math.min(...yaws));
      await r.unmount();
    }
    // Both resting states really swing, to both sides.
    expect(ranges[0]).toBeGreaterThan(1.1);
    expect(ranges[3]).toBeGreaterThan(1.1);
  });

  it("ships the segment mark, and keeps the board mark behind a lazy import", async () => {
    const real = await vi.importActual<typeof import("@/components/mark/MarkSlot")>("@/components/mark/MarkSlot");
    expect(real.ACTIVE_MARK).toBe("segment");
    expect(Object.keys(real.MARKS)).toEqual(["segment", "board"]);
    expect((real.MARKS.board as unknown as { $$typeof: symbol }).$$typeof).toBe(Symbol.for("react.lazy"));
  });

  it("keeps the segment mark inside the contract box, centred, with no light or camera of its own", async () => {
    const r = await ReactThreeTestRenderer.create(<SegmentMark progressRef={num(0)} accent="#E08030" reduced={false} />);
    const scene = r.scene.instance as unknown as Object3D;
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    expect(size.x).toBeLessThanOrEqual(2.1 + 1e-6);
    expect(size.y).toBeLessThanOrEqual(1.0 + 1e-6);
    expect(size.z).toBeLessThanOrEqual(0.3 + 1e-6);
    expect(centre.length()).toBeLessThan(1e-6);
    let bad = 0;
    scene.traverse((o) => {
      const t = o as Object3D & { isLight?: boolean; isCamera?: boolean };
      if (t.isLight || t.isCamera) bad++;
    });
    expect(bad).toBe(0);
    await r.unmount();
  });
});

describe("seven segments", () => {
  it("spells 411", () => {
    expect(MARK_DIGITS.map((d) => d.value).join("")).toBe("411");
    expect(segmentsFor("4")).toEqual(["f", "g", "b", "c"]);
    expect(segmentsFor("1")).toEqual(["b", "c"]);
    expect(segmentsFor("8")).toHaveLength(ALL_SEGMENTS.length);
    expect(segmentsFor("x")).toEqual([]);
  });
});
