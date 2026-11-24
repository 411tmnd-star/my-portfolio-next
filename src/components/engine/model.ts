/**
 * The Live engine diorama in plain Three. One build function, one pose function: pose(stateAt(t)) is the
 * only thing that moves anything, so any frame can be rebuilt from its time alone.
 */
import {
  BoxGeometry, BufferAttribute, BufferGeometry, CanvasTexture, Color, CylinderGeometry,
  DataTexture, DirectionalLight, EdgesGeometry, ExtrudeGeometry, Group, HemisphereLight, LineBasicMaterial, LineSegments,
  LinearFilter, Material, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, OctahedronGeometry, PlaneGeometry, PointLight, Shape,
  SphereGeometry, SRGBColorSpace, TorusGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { BoardGeometry } from "./boardGeometry";
import {
  BOARD, CAMERA_TARGET, CARD, CORE, ISO_TILT, ISO_YAW, PALETTE, PATH, RAMP_LENGTH, STATION_SLOTS, type Point,
} from "./layout";
import type { EngineState } from "./timeline";

export type Pass = "final" | "clay" | "wire";
export type CardLine = { title: string; line: string };

export type EngineOptions = {
  /** Lines for the status card, by station slot index. Stations not in the map are not built. */
  lines: Map<number, CardLine>;
  opening: CardLine;
  fontFamily?: string;
};

export type Engine = {
  root: Group;
  pose: (s: EngineState) => void;
  setPass: (pass: Pass) => void;
  /** For objects that live outside this model (the hub mark), so that a pass can cover them too. */
  passMaterial: (pass: "clay" | "wire") => Material;
  addWire: (mesh: Mesh) => void;
  setRobot: (robot: Object3D) => void;
  /** Every object whose transform the loop drives, by name. */
  moving: Map<string, Object3D>;
  dispose: () => void;
};

const EPS = 1e-4;
const TAU = Math.PI * 2;

// ------------------------------------------------------------------ geometry helpers
const rounded = (w: number, h: number, d: number, r = 0.06) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2));

const RIBBON_STEP = 18; // vertices per step: top and two walls

/** Offsets a polyline sideways with mitred corners, then lays a low raised strip of the given width along it. */
function ribbon(points: Point[], offset: number, width: number, y: number, step = 0.08): { geometry: BufferGeometry; count: number } {
  const n = points.length;
  const dirs = points.slice(1).map((p, i) => {
    const dx = p.x - points[i].x;
    const dz = p.z - points[i].z;
    const l = Math.hypot(dx, dz);
    return { x: dx / l, z: dz / l, l };
  });
  const side = (o: number) =>
    points.map((p, i) => {
      const a = dirs[Math.max(0, i - 1)];
      const b = dirs[Math.min(dirs.length - 1, i)];
      const na = { x: -a.z, z: a.x };
      const nb = { x: -b.z, z: b.x };
      const m = { x: na.x + nb.x, z: na.z + nb.z };
      const k = (2 * o) / (m.x * m.x + m.z * m.z);
      return { x: p.x + m.x * k, z: p.z + m.z * k };
    });
  const left = side(offset - width / 2);
  const right = side(offset + width / 2);
  const verts: number[] = [];
  const normals: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const cuts = Math.max(1, Math.round(dirs[i].l / step));
    for (let c = 0; c < cuts; c++) {
      const u = c / cuts;
      const w = (c + 1) / cuts;
      const at = (s: Point[], k: number, h: number): [number, number, number] => [
        s[i].x + (s[i + 1].x - s[i].x) * k, h, s[i].z + (s[i + 1].z - s[i].z) * k,
      ];
      const quad = (a: number[], b: number[], d: number[], e: number[], nor: [number, number, number]) => {
        verts.push(...a, ...b, ...d, ...b, ...e, ...d);
        for (let q = 0; q < 6; q++) normals.push(...nor);
      };
      const nl: [number, number, number] = [dirs[i].z, 0, -dirs[i].x];
      const nr: [number, number, number] = [-dirs[i].z, 0, dirs[i].x];
      quad(at(left, u, y), at(right, u, y), at(left, w, y), at(right, w, y), [0, 1, 0]);
      quad(at(left, u, 0), at(left, u, y), at(left, w, 0), at(left, w, y), nl);
      quad(at(right, u, y), at(right, u, 0), at(right, w, y), at(right, w, 0), nr);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(verts), 3));
  geometry.setAttribute("normal", new BufferAttribute(new Float32Array(normals), 3));
  return { geometry, count: verts.length / 3 };
}

/** A round alpha gradient, made of numbers so that it needs no canvas. */
function softDisc(size = 64): DataTexture {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.hypot((x + 0.5) / size - 0.5, (y + 0.5) / size - 0.5) * 2;
      const a = Math.max(0, 1 - r);
      data.set([255, 255, 255, Math.round(255 * a * a * (3 - 2 * a))], (y * size + x) * 4);
    }
  }
  const t = new DataTexture(data, size, size);
  t.magFilter = LinearFilter;
  t.minFilter = LinearFilter;
  t.needsUpdate = true;
  return t;
}

function teeShape(): Shape {
  const s = new Shape();
  s.moveTo(-0.3, 0);
  s.lineTo(0.3, 0);
  s.lineTo(0.3, 0.52);
  s.lineTo(0.52, 0.4);
  s.lineTo(0.64, 0.64);
  s.lineTo(0.34, 0.86);
  s.lineTo(0.15, 0.9);
  s.quadraticCurveTo(0, 0.78, -0.15, 0.9);
  s.lineTo(-0.34, 0.86);
  s.lineTo(-0.64, 0.64);
  s.lineTo(-0.52, 0.4);
  s.lineTo(-0.3, 0.52);
  s.closePath();
  return s;
}

// ------------------------------------------------------------------ status card
class StatusCard {
  readonly group = new Group();
  readonly texture: CanvasTexture | null = null;
  private shown = "";
  private readonly ctx: CanvasRenderingContext2D | null = null;

  constructor(slab: Material, private readonly font: string) {
    const body = new Mesh(rounded(CARD.width, CARD.height, 0.1, 0.05), slab);
    body.name = "card-slab";
    body.castShadow = true;
    this.group.add(body);
    if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = Math.round((1024 * CARD.height) / CARD.width);
      this.ctx = canvas.getContext("2d");
      if (this.ctx) {
        this.texture = new CanvasTexture(canvas);
        this.texture.colorSpace = SRGBColorSpace;
        this.texture.anisotropy = 4;
      }
    }
    const face = new Mesh(
      new PlaneGeometry(CARD.width * 0.985, CARD.height * 0.97),
      new MeshStandardMaterial({ map: this.texture, emissiveMap: this.texture, emissive: "#ffffff", emissiveIntensity: 0.62, color: "#555", roughness: 1 }),
    );
    face.name = "card-face";
    face.position.z = 0.056;
    this.group.add(face);
  }

  show(line: CardLine, progress: number): void {
    const key = `${line.title}|${line.line}|${progress.toFixed(2)}`;
    if (!this.ctx || !this.texture || key === this.shown) return;
    this.shown = key;
    const { width: w, height: h } = this.ctx.canvas;
    const c = this.ctx;
    c.fillStyle = PALETTE.panel;
    c.fillRect(0, 0, w, h);
    c.fillStyle = PALETTE.cyan;
    c.beginPath();
    c.arc(78, 92, 15, 0, TAU);
    c.fill();
    c.font = `500 40px ${this.font}`;
    c.fillText("411 ENGINE", 116, 106);
    c.fillStyle = PALETTE.text;
    this.fit(line.title, 62, 250, w - 124, 70, 600);
    c.fillStyle = "#A3AEBA";
    this.wrapText(line.line, 62, 340, w - 124, 46, 400, 60);
    c.fillStyle = PALETTE.edge;
    c.fillRect(62, h - 62, w - 124, 8);
    c.fillStyle = PALETTE.cyan;
    c.fillRect(62, h - 62, (w - 124) * progress, 8);
    this.texture.needsUpdate = true;
  }

  /** One line, shrunk until it fits. */
  private fit(text: string, x: number, y: number, max: number, size: number, weight: number): void {
    if (!this.ctx) return;
    let s = size;
    do {
      this.ctx.font = `${weight} ${s}px ${this.font}`;
      s -= 2;
    } while (s > 24 && this.ctx.measureText(text).width > max);
    this.ctx.fillText(text, x, y);
  }

  private wrapText(text: string, x: number, y: number, max: number, size: number, weight: number, lead: number): void {
    if (!this.ctx) return;
    this.ctx.font = `${weight} ${size}px ${this.font}`;
    let line = "";
    let top = y;
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (this.ctx.measureText(next).width > max && line) {
        this.ctx.fillText(line, x, top);
        top += lead;
        line = word;
      } else line = next;
    }
    this.ctx.fillText(line, x, top);
  }
}

// ------------------------------------------------------------------ build
export function buildEngine({ lines, opening, fontFamily = "ui-monospace, monospace" }: EngineOptions): Engine {
  const root = new Group();
  root.name = "engine";
  const moving = new Map<string, Object3D>();
  const matte = (color: string, roughness = 0.82, extra: object = {}) => new MeshStandardMaterial({ color, roughness, metalness: 0, ...extra });

  const M = {
    board: matte(PALETTE.board, 0.9),
    edge: matte(PALETTE.edge, 0.8),
    panel: matte(PALETTE.panel, 0.85),
    pale: matte("#9AA6B0", 0.75),
    amber: matte(PALETTE.amber, 0.55, { emissive: new Color(PALETTE.amber), emissiveIntensity: 0.22 }),
    inner: matte("#0E1A20", 0.9, { emissive: new Color(PALETTE.cyan), emissiveIntensity: 0 }),
  };
  const signal = () => matte("#12323A", 0.6, { emissive: new Color(PALETTE.cyan), emissiveIntensity: 0 });

  const add = (parent: Object3D, name: string, object: Object3D, track = true) => {
    object.name = name;
    parent.add(object);
    if (track) moving.set(name, object);
    return object;
  };
  const mesh = (parent: Object3D, geometry: BufferGeometry, material: Material, x = 0, y = 0, z = 0) => {
    const m = new Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const group = (name: string, x = 0, y = 0, z = 0) => {
    const g = new Group();
    g.position.set(x, y, z);
    add(root, name, g);
    return g;
  };
  const scaleTo = (o: Object3D, s: number) => {
    o.visible = s > 2 * EPS;
    o.scale.setScalar(Math.max(EPS, s));
  };

  // -- lights: one soft key, a cool rim, a low fill
  const key = new DirectionalLight("#FFF3E4", 2.9);
  key.position.set(-3.5, 11, 6.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 3;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.035;
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  const rim = new DirectionalLight("#7FB7D6", 1.5);
  rim.position.set(6, 4, -9);
  const fill = new HemisphereLight("#B9CBDD", "#10151B", 1.35);
  root.add(key, key.target, rim, rim.target, fill);

  // -- soft occlusion: a dark round gradient under everything that stands on the board
  const aoTexture = softDisc();
  const aoMaterial = new MeshBasicMaterial({ map: aoTexture, transparent: true, depthWrite: false, opacity: 0.62, color: "#05070A" });
  const occlusion: Mesh[] = [];
  const shade = (parent: Object3D, w: number, d: number, x = 0, z = 0, y = 0.006) => {
    const m = new Mesh(new PlaneGeometry(w, d).rotateX(-Math.PI / 2), aoMaterial);
    m.position.set(x, y, z);
    m.renderOrder = 1;
    m.userData.ao = true;
    parent.add(m);
    occlusion.push(m);
  };

  // -- board
  const boardGeometry = new BoardGeometry();
  const board = new Mesh(boardGeometry, M.board);
  board.receiveShadow = true;
  board.castShadow = true;
  add(root, "board", board);

  // -- fittings printed on the board: mounting rings and pads
  const fittings = group("fittings");
  for (const [x, z] of [[-4.3, -4.3], [4.3, -4.3], [4.3, 4.3], [-4.3, 4.3]]) {
    mesh(fittings, new TorusGeometry(0.2, 0.045, 10, 40).rotateX(Math.PI / 2), M.amber, x, 0.02, z);
  }
  const padAt: Point[] = [];
  for (let i = 0; i < 7; i++) padAt.push({ x: -4.4 + i * 0.28, z: 2.35 }, { x: 4.45, z: -1.2 + i * 0.28 });
  for (const p of padAt) mesh(fittings, rounded(0.13, 0.05, 0.13, 0.02), M.edge, p.x, 0.02, p.z);

  // -- trace: three parallel lanes, 45 degree corners only
  const lanes = [-0.24, 0, 0.24].map((offset, i) => {
    const { geometry, count } = ribbon(PATH, offset, i === 1 ? 0.07 : 0.1, 0.034);
    const m = new Mesh(geometry, M.amber);
    m.receiveShadow = true;
    m.name = `trace-${i}`;
    root.add(m);
    return { m, count };
  });

  // -- ramp off the front edge
  const end = PATH[PATH.length - 1];
  const rampGroup = group("ramp", end.x, -0.13, end.z);
  mesh(rampGroup, rounded(1.5, 0.22, RAMP_LENGTH, 0.06), M.edge, 0, 0.02, RAMP_LENGTH / 2);
  for (const o of [-0.24, 0, 0.24]) mesh(rampGroup, new BoxGeometry(o === 0 ? 0.07 : 0.1, 0.02, RAMP_LENGTH - 0.1), M.amber, o, 0.137, RAMP_LENGTH / 2);

  // -- core: two halves that split, a roof that stays, light inside
  const core = group("core", CORE.x, 0, CORE.z);
  shade(core, CORE.width * 1.55, CORE.depth * 1.75);
  const half = CORE.width / 2;
  const halves = ([-1, 1] as const).map((sign) => {
    const g = new Group();
    add(core, sign < 0 ? "core-left" : "core-right", g);
    const x = (sign * half) / 2;
    mesh(g, rounded(half, CORE.height, CORE.depth, 0.09), M.panel, x, CORE.height / 2, 0);
    for (let i = 0; i < 4; i++) mesh(g, rounded(half * 0.62, 0.05, 0.05, 0.02), M.edge, x, 0.5 + i * 0.36, CORE.depth / 2 + 0.005);
    mesh(g, rounded(0.05, CORE.height * 0.72, 0.06, 0.02), M.amber, x + sign * half * 0.42, CORE.height / 2, CORE.depth / 2 + 0.01);
    return g;
  });
  const chamber = mesh(core, rounded(CORE.gap * 2 + 0.5, CORE.height * 0.96, 0.08, 0.03), M.inner, 0, CORE.height * 0.48, -CORE.depth / 2 + 0.12);
  chamber.castShadow = false;
  const glowFloor = mesh(core, rounded(CORE.gap * 2 + 0.1, 0.03, CORE.depth * 0.9, 0.01), M.inner, 0, 0.02, 0);
  glowFloor.castShadow = false;
  mesh(core, rounded(CORE.width + 0.1, CORE.roof, CORE.depth + 0.1, 0.07), M.edge, 0, CORE.height + CORE.roof / 2, 0);
  const lamp = new PointLight(PALETTE.cyan, 0, 5, 1.4);
  lamp.position.set(0, 1.1, 0.5);
  core.add(lamp);

  // -- stations
  const signals: (MeshStandardMaterial | null)[] = [];
  const stationGroups: (Group | null)[] = [];
  const spurs: ({ m: Mesh; count: number } | null)[] = [];
  const bars: Mesh[] = [];
  STATION_SLOTS.forEach((slot, i) => {
    if (!lines.has(i)) {
      signals.push(null);
      stationGroups.push(null);
      spurs.push(null);
      return;
    }
    const lit = signal();
    signals.push(lit);
    const g = group(`station-${slot.id}`, slot.at.x, 0, slot.at.z);
    stationGroups.push(g);
    shade(g, 1.95, 1.95);
    mesh(g, rounded(1.16, 0.16, 1.16, 0.06), M.edge, 0, 0.08, 0);
    const ring = mesh(g, rounded(1.0, 0.03, 1.0, 0.01), lit, 0, 0.17, 0);
    ring.castShadow = false;
    mesh(g, rounded(0.9, 0.04, 0.9, 0.01), M.panel, 0, 0.18, 0);
    stationObject(i, g, lit);

    const { geometry, count } = ribbon([slot.from, slot.at], 0, 0.09, 0.03, 0.05);
    const spur = new Mesh(geometry, M.amber);
    spur.receiveShadow = true;
    spur.name = `spur-${slot.id}`;
    root.add(spur);
    spurs.push({ m: spur, count });
  });

  function stationObject(i: number, g: Group, lit: MeshStandardMaterial): void {
    const y = 0.2;
    if (i === 0) {
      // an armature: three bones and their joints
      let at: [number, number] = [0, y + 0.08];
      for (const [angle, len] of [[0.16, 0.42], [-0.42, 0.36], [0.5, 0.3]] as const) {
        const bone = mesh(g, new OctahedronGeometry(0.5, 0), M.pale, at[0] + (Math.sin(angle) * len) / 2, at[1] + (Math.cos(angle) * len) / 2, 0);
        bone.scale.set(0.2, len, 0.2);
        bone.rotation.z = -angle;
        mesh(g, new SphereGeometry(0.07, 20, 14), lit, at[0], at[1], 0);
        at = [at[0] + Math.sin(angle) * len, at[1] + Math.cos(angle) * len];
      }
      mesh(g, new SphereGeometry(0.1, 20, 14), lit, at[0], at[1], 0);
    } else if (i === 1) {
      const tee = new ExtrudeGeometry(teeShape(), { depth: 0.16, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 14 });
      tee.translate(0, 0, -0.08);
      const t = mesh(g, tee, M.pale, 0, y + 0.1, 0);
      t.rotation.y = 0.2;
      mesh(g, new CylinderGeometry(0.035, 0.035, 0.22, 16), lit, 0, y + 0.05, 0);
    } else if (i === 2) {
      // candidate, approve, publish, rollback: four plates, the last one set back
      for (let k = 0; k < 4; k++) {
        const x = k === 3 ? -0.14 : -0.14 + k * 0.1;
        mesh(g, rounded(0.56, 0.12, 0.66, 0.04), k === 2 ? lit : M.pale, x, y + 0.08 + k * 0.19, k === 3 ? -0.08 : 0);
      }
    } else if (i === 3) {
      for (let k = 0; k < 5; k++) {
        const bar = mesh(g, rounded(0.11, 1, 0.3, 0.03), k === 2 ? lit : M.pale, -0.34 + k * 0.17, y, 0);
        add(g, `bar-${k}`, bar);
        bars.push(bar);
      }
    } else {
      // a helmet with a visor
      const head = mesh(g, new SphereGeometry(0.38, 40, 28), M.pale, 0, y + 0.44, 0);
      head.scale.set(0.92, 1.15, 0.96);
      const visor = mesh(g, rounded(0.44, 0.34, 0.16, 0.07), M.panel, 0, y + 0.44, 0.3);
      visor.castShadow = false;
      mesh(g, rounded(0.28, 0.035, 0.02, 0.01), lit, 0, y + 0.36, 0.386);
      mesh(g, new CylinderGeometry(0.16, 0.2, 0.14, 28), M.edge, 0, y + 0.03, 0);
    }
  }

  // -- two small board props, seven props in all with the stations
  const props = [group("prop-0", 4.2, 0, -3.5), group("prop-1", -3.9, 0, 3.9)];
  for (const [x, z, h] of [[0, 0, 0.62], [-0.42, 0.28, 0.4]] as const) {
    mesh(props[0], new CylinderGeometry(0.17, 0.17, h, 32), M.edge, x, h / 2, z);
    mesh(props[0], new CylinderGeometry(0.15, 0.17, 0.05, 32), M.pale, x, h + 0.02, z);
  }
  shade(props[0], 1.3, 1.1, -0.2, 0.14);
  shade(props[1], 1.4, 1.4);
  mesh(props[1], rounded(0.8, 0.14, 0.8, 0.04), M.panel, 0, 0.09, 0);
  mesh(props[1], new CylinderGeometry(0.05, 0.05, 0.02, 20), M.amber, -0.24, 0.17, 0.24);
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) mesh(props[1], rounded(0.12, 0.05, 0.09, 0.02), M.amber, s * 0.44, 0.04, -0.27 + k * 0.18);

  // -- status card, parallel to the screen, upper left, outside the board
  const card = new StatusCard(M.edge, fontFamily);
  add(root, "card", card.group);
  const cardRest = screenToWorld(CARD.center[0], CARD.center[1]);
  card.group.rotation.set(-ISO_TILT, -ISO_YAW, 0, "YXZ");

  // -- robot on its carrier
  const robot = group("robot");
  shade(robot, 1.7, 1.7, 0, 0, 0.04);
  mesh(robot, rounded(0.98, 0.12, 0.98, 0.05), M.edge, 0, 0.1, 0);
  const strip = signal();
  strip.emissiveIntensity = 1.1;
  mesh(robot, rounded(0.6, 0.03, 0.06, 0.01), strip, 0, 0.17, 0.4).castShadow = false;
  const rider = new Group();
  rider.position.y = 0.16;
  robot.add(rider);

  // -- ribs, only in the wireframe pass
  const ribs = new Group();
  ribs.visible = false;
  root.add(ribs);
  {
    const p: number[] = [];
    for (let x = -4.75; x <= 4.76; x += 0.25) {
      const inset = Math.max(0, Math.abs(x) - (5 - BOARD.corner));
      const w = 5 - (BOARD.corner - Math.sqrt(Math.max(0, BOARD.corner ** 2 - inset ** 2))) - 0.12;
      p.push(x, 0.004, -w, x, 0.004, w);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(p), 3));
    ribs.add(new LineSegments(geometry, new LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.16 })));
  }

  // ---------------------------------------------------------------- pose
  const lineFor = (station: number) => lines.get(station) ?? opening;

  function pose(s: EngineState): void {
    boardGeometry.unroll(s.boardUnrolled);
    board.visible = s.boardScale > 2 * EPS;
    const bs = Math.max(EPS, s.boardScale);
    board.scale.setScalar(bs);
    // scales about the roll, which starts near the middle of the frame and slides out as it unrolls
    board.position.set(-(BOARD.size / 2) * (1 - bs) + 3 * (1 - s.boardUnrolled), 0, 0);

    fittings.visible = s.fittings > 2 * EPS;
    for (const f of fittings.children) f.scale.setScalar(Math.max(EPS, s.fittings));
    core.visible = s.core > 2 * EPS;
    core.scale.set(Math.max(EPS, Math.min(1, s.core * 1.6)), Math.max(EPS, s.core), Math.max(EPS, Math.min(1, s.core * 1.6)));
    halves[0].position.x = -CORE.gap * s.coreOpen;
    halves[1].position.x = CORE.gap * s.coreOpen;
    M.inner.emissiveIntensity = 1.15 * s.coreLight;
    lamp.intensity = 14 * s.coreLight;

    for (const { m, count } of lanes) {
      const from = Math.floor((count * s.traceFrom) / RIBBON_STEP) * RIBBON_STEP;
      const to = Math.floor((count * s.traceTo) / RIBBON_STEP) * RIBBON_STEP;
      m.geometry.setDrawRange(from, Math.max(0, to - from));
      m.visible = to > from;
    }
    rampGroup.visible = s.ramp > 2 * EPS;
    rampGroup.scale.set(1, 1, Math.max(EPS, s.ramp));

    stationGroups.forEach((g, i) => {
      if (!g) return;
      scaleTo(g, s.stations[i].scale);
      const lit = signals[i];
      if (lit) lit.emissiveIntensity = 0.06 + 1.25 * s.stations[i].lit;
      const spur = spurs[i];
      if (spur) {
        const n = Math.floor((spur.count * s.stations[i].spur) / RIBBON_STEP) * RIBBON_STEP;
        spur.m.geometry.setDrawRange(0, n);
        spur.m.visible = n > 0;
      }
    });
    bars.forEach((bar, k) => {
      const h = 0.2 + 0.72 * s.bars[k];
      bar.scale.y = h;
      bar.position.y = 0.2 + h / 2;
    });
    props.forEach((p, i) => scaleTo(p, s.props[i]));

    card.group.visible = s.card > 2 * EPS;
    const slide = (1 - Math.min(1, s.card)) * -1.6;
    const [cx, cy, cz] = [cardRest.x, cardRest.y, cardRest.z];
    card.group.position.set(cx + slide * Math.SQRT1_2, cy, cz - slide * Math.SQRT1_2);
    card.group.scale.setScalar(Math.max(EPS, 0.6 + 0.4 * s.card));
    card.show(lineFor(s.cardStation), Math.min(1, (s.cardStation + 1) / STATION_SLOTS.length));

    robot.visible = s.robot.visible > 2 * EPS;
    robot.scale.setScalar(Math.max(EPS, s.robot.visible));
    robot.position.set(s.robot.x, s.robot.y, s.robot.z);
    robot.rotation.y = s.robot.heading;
  }

  // ---------------------------------------------------------------- passes
  const originals = new Map<Mesh, Material | Material[]>();
  let wires: LineSegments[] = [];
  const clay = new MeshStandardMaterial({ color: "#5B636B", roughness: 1 });
  const wireFill = new MeshStandardMaterial({ color: "#0F151B", emissive: "#0F151B", emissiveIntensity: 0.6, roughness: 1 });
  const wireLine = new LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.95 });

  function setPass(pass: Pass): void {
    for (const w of wires) {
      w.parent?.remove(w);
      w.geometry.dispose();
    }
    wires = [];
    const meshes: Mesh[] = [];
    root.traverse((o) => {
      if (o instanceof Mesh) meshes.push(o);
    });
    for (const m of meshes) {
      if (m.userData.ao) continue;
      if (!originals.has(m)) originals.set(m, m.material);
      m.material = pass === "final" ? (originals.get(m) as Material) : pass === "clay" ? clay : wireFill;
      if (pass === "wire") addWire(m);
    }
    key.castShadow = pass !== "wire";
    lamp.visible = pass === "final";
    ribs.visible = pass === "wire";
    for (const o of occlusion) o.visible = pass !== "wire";
  }

  function addWire(m: Mesh): void {
    const w = new LineSegments(new EdgesGeometry(m.geometry, m.userData.heavy === true ? 22 : 8), wireLine);
    w.name = "wire";
    m.add(w);
    wires.push(w);
  }

  function setRobot(model: Object3D): void {
    rider.clear();
    rider.add(model);
  }

  return {
    root,
    pose,
    setPass,
    passMaterial: (pass) => (pass === "clay" ? clay : wireFill),
    addWire,
    setRobot,
    moving,
    dispose: () => {
      root.traverse((o) => {
        if (o instanceof Mesh || o instanceof LineSegments) o.geometry.dispose();
      });
      for (const m of [...Object.values(M), ...signals, strip, clay, wireFill, wireLine, aoMaterial]) m?.dispose();
      aoTexture.dispose();
      card.texture?.dispose();
    },
  };
}

/** A point on the camera plane, in frame units from the centre, brought forward so that nothing hides it. */
export function screenToWorld(right: number, up: number, toward = 14): { x: number; y: number; z: number } {
  const r = [Math.SQRT1_2, 0, -Math.SQRT1_2];
  const u = [-1 / Math.sqrt(6), 2 / Math.sqrt(6), -1 / Math.sqrt(6)];
  const f = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
  return {
    x: CAMERA_TARGET[0] + r[0] * right + u[0] * up + f[0] * toward,
    y: CAMERA_TARGET[1] + r[1] * right + u[1] * up + f[1] * toward,
    z: CAMERA_TARGET[2] + r[2] * right + u[2] * up + f[2] * toward,
  };
}

/** Snapshot of every driven transform, for the period test. */
export function snapshot(engine: Engine): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  engine.root.updateMatrixWorld(true);
  for (const [name, o] of engine.moving) out[name] = [...o.matrixWorld.elements, o.visible ? 1 : 0];
  return out;
}
