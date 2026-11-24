import { describe, expect, it } from "vitest";
import { boardFrame, BoardGeometry, halfWidth } from "@/components/engine/boardGeometry";
import { BOARD, distanceTo, HUB, PATH, PATH_LENGTH, project, samplePath, STATION_SLOTS } from "@/components/engine/layout";
import { buildEngine, snapshot } from "@/components/engine/model";
import { BEATS, LOOP_SECONDS, rideDistance, stateAt, STATION_TIMES, timeAtDistance, wrap } from "@/components/engine/timeline";

const build = () =>
  buildEngine({ lines: new Map(STATION_SLOTS.map((s, i) => [i, { title: s.id, line: "x" }])), opening: { title: "t", line: "l" } });

describe("timeline", () => {
  it("is the same picture at 0 and at 12, without wrapping", () => {
    const flat = (o: unknown): number[] => (typeof o === "number" ? [o] : o && typeof o === "object" ? Object.values(o).flatMap(flat) : []);
    const a = flat(stateAt(0));
    const b = flat(stateAt(LOOP_SECONDS));
    expect(a.length).toBeGreaterThan(30);
    a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(1e-6));
  });

  it("covers the 12 seconds with the five beats and no gap", () => {
    expect(BEATS.map((b) => b.name)).toEqual(["Assemble", "Activate", "Automate", "Teardown", "Hold"]);
    expect([BEATS[0].from, ...BEATS.map((b) => b.to)]).toEqual([0, 2.0, 3.2, 9.8, 11.8, 12.0]);
    BEATS.slice(1).forEach((b, i) => expect(b.from).toBe(BEATS[i].to));
  });

  it("follows the beats", () => {
    const at = stateAt;
    expect(at(2.0)).toMatchObject({ boardUnrolled: 1, core: 1, traceTo: 1, card: 0, coreOpen: 0 });
    expect(at(2.0).stations.every((s) => s.scale === 1)).toBe(true);
    expect(at(3.2)).toMatchObject({ card: 1, coreOpen: 1, coreLight: 1 });
    expect(rideDistance(3.2)).toBe(0);
    expect(rideDistance(9.8)).toBeCloseTo(PATH_LENGTH, 6);
    expect(at(9.8).robot.z).toBeCloseTo(5, 6);
    expect(at(11.8)).toMatchObject({ boardScale: 0, core: 0, hub: 0, card: 0, ramp: 0 });
    for (const t of [11.8, 11.9, 12]) expect(at(t).stations.every((s) => s.scale === 0)).toBe(true);
  });

  it("pops in with overshoot and out without", () => {
    const peak = (from: number, to: number) => Math.max(...Array.from({ length: 200 }, (_, i) => stateAt(from + ((to - from) * i) / 199).core));
    expect(peak(0.6, 1.2)).toBeGreaterThan(1.05);
    expect(peak(10.8, 11.2)).toBeLessThanOrEqual(1);
  });

  it("lights each station as the robot passes, in path order", () => {
    expect([...STATION_TIMES]).toEqual([...STATION_TIMES].sort((a, b) => a - b));
    STATION_TIMES.forEach((when, i) => {
      expect(when).toBeGreaterThan(3.2);
      expect(when).toBeLessThan(9.8);
      expect(stateAt(when - 0.3).stations[i].lit).toBe(0);
      expect(stateAt(when + 0.2).stations[i].lit).toBe(1);
      expect(stateAt(when + 0.1).cardStation).toBe(i);
      expect(rideDistance(when)).toBeCloseTo(distanceTo(STATION_SLOTS[i].from), 6);
      expect(timeAtDistance(rideDistance(when))).toBeCloseTo(when, 6);
    });
  });

  it("has no jump anywhere while things are visible", () => {
    const dt = 1 / 240;
    for (let t = 0; t < 12; t += dt) {
      const [a, b] = [stateAt(t), stateAt(t + dt)];
      expect(Math.abs(a.boardUnrolled - b.boardUnrolled)).toBeLessThan(0.06);
      if (a.robot.visible > 0.01 && b.robot.visible > 0.01) expect(Math.hypot(a.robot.x - b.robot.x, a.robot.z - b.robot.z)).toBeLessThan(0.05);
    }
  });

  it("wraps running time into the loop", () => {
    expect(wrap(12)).toBe(0);
    expect(wrap(25.5)).toBeCloseTo(1.5);
    expect(wrap(-1)).toBe(11);
  });
});

describe("layout", () => {
  it("turns the trace by 45 degrees only", () => {
    const dirs = PATH.slice(1).map((p, i) => Math.atan2(p.x - PATH[i].x, p.z - PATH[i].z));
    for (const d of dirs) expect(Math.abs((d / (Math.PI / 4)) - Math.round(d / (Math.PI / 4)))).toBeLessThan(1e-9);
    dirs.slice(1).forEach((d, i) => {
      const turn = Math.abs(Math.atan2(Math.sin(d - dirs[i]), Math.cos(d - dirs[i])));
      expect(turn).toBeCloseTo(Math.PI / 4, 9);
    });
  });

  it("keeps the reference's restraint: one path, seven props at most", () => {
    expect(STATION_SLOTS.length + 2).toBeLessThanOrEqual(7);
  });

  it("keeps stations on the board and the trace clear of them", () => {
    for (const s of STATION_SLOTS) {
      expect(Math.abs(s.at.x)).toBeLessThan(5 - 0.58);
      expect(Math.abs(s.at.z)).toBeLessThan(5 - 0.58);
      for (let d = 0; d < PATH_LENGTH; d += 0.1) {
        const p = samplePath(d);
        expect(Math.max(Math.abs(p.x - s.at.x), Math.abs(p.z - s.at.z))).toBeGreaterThan(0.58);
      }
    }
  });

  it("projects into the frame", () => {
    for (const p of [HUB, ...STATION_SLOTS.map((s) => [s.at.x, s.labelY, s.at.z] as [number, number, number])]) {
      const { left, top } = project(p);
      expect(left).toBeGreaterThan(0.1);
      expect(left).toBeLessThan(0.9);
      expect(top).toBeGreaterThan(0.02);
      expect(top).toBeLessThan(0.95);
    }
  });
});

describe("board", () => {
  it("neither stretches nor shrinks while it rolls", () => {
    for (const f of [0, 2.5, 7, 10]) {
      let length = 0;
      const n = 40000;
      for (let i = 0; i < n; i++) {
        const a = boardFrame((BOARD.size * i) / n, f);
        const b = boardFrame((BOARD.size * (i + 1)) / n, f);
        length += Math.hypot(a.x - b.x, a.y - b.y);
      }
      expect(Math.abs(length - BOARD.size)).toBeLessThan(0.06);
    }
  });

  it("is flat when unrolled, rounded at the corners, and finite when rolled", () => {
    expect(boardFrame(10, 10)).toEqual({ x: 10, y: 0, nx: 0, ny: 1 });
    expect(halfWidth(5)).toBe(5);
    expect(halfWidth(0)).toBeCloseTo(5 - BOARD.corner, 9);
    for (const f of [0, 0.3, 1]) {
      const g = new BoardGeometry(f);
      expect([...g.getAttribute("position").array].every(Number.isFinite)).toBe(true);
      expect([...g.getAttribute("normal").array].every(Number.isFinite)).toBe(true);
    }
  });
});

describe("model", () => {
  it("returns every driven transform to where it started", () => {
    const engine = build();
    engine.pose(stateAt(0));
    const a = snapshot(engine);
    engine.pose(stateAt(6));
    const mid = snapshot(engine);
    engine.pose(stateAt(12));
    const b = snapshot(engine);
    expect(Object.keys(a).length).toBeGreaterThan(18);
    for (const [name, m] of Object.entries(a)) m.forEach((v, i) => expect(Math.abs(v - b[name][i]), name).toBeLessThan(1e-6));
    expect(Object.entries(a).some(([name, m]) => m.some((v, i) => Math.abs(v - mid[name][i]) > 0.1))).toBe(true);
  });

  it("does not depend on the order frames are drawn in", () => {
    const one = build();
    const two = build();
    for (const t of [1, 9, 3, 7.7]) one.pose(stateAt(t));
    one.pose(stateAt(5));
    two.pose(stateAt(5));
    expect(snapshot(one)).toEqual(snapshot(two));
  });

  it("builds only the stations it has lines for", () => {
    const engine = buildEngine({ lines: new Map([[0, { title: "a", line: "b" }]]), opening: { title: "t", line: "l" } });
    expect([...engine.moving.keys()].filter((k) => k.startsWith("station-"))).toEqual([`station-${STATION_SLOTS[0].id}`]);
    expect(() => engine.pose(stateAt(6))).not.toThrow();
    for (const pass of ["wire", "clay", "final"] as const) expect(() => engine.setPass(pass)).not.toThrow();
  });
});
