/**
 * Every project and every number on the home page. A number without a proofUrl fails the build
 * (assertProjects runs when this module loads, which is during `next build`).
 *
 * Numbers come from 00_CLEAN_INDEX/OPTION_A_CV_VERIFIED_FACT_SHEET.md. Proof links are pinned to a commit.
 */

const GH = "https://github.com/411tmnd-star";
const blob = (repo: string, sha: string, path: string) => `${GH}/${repo}/blob/${sha}/${path}`;

const RIG = "3f809613c339dd0ecf196ac9feba41c48d1c028f";
const GARMENT = "bb209ec1ead83dc6c6653404d5abf181618946a2";
const PIPELINE = "dfa4ad7e2220210e1470e42b3b8f7f60e41bb010";
const ROBOT = "16fe21d7ba1229fa5c9cd6caa305f4c335d9836b";

export const CATALOGUE_URL = "https://better-style-shop.vercel.app/catalogue/";
export const STUDIO_URL = "https://better-style-shop.vercel.app/catalogue/#/fitting";
export const AUDIO_LAB_URL = "https://audio-lab-two.vercel.app";

export type Metric = { label: string; value: string; proofUrl: string };
export type Link = { label: string; href: string };
export type Media =
  | { kind: "model"; src: string; poster: string; alt: string; caption: string; width: number; height: number }
  | { kind: "image"; src: string; alt: string; caption: string; width: number; height: number; motion?: string };

export type Project = {
  id: string;
  /** Slot on the stage, by id in engine/layout.ts. */
  station: string;
  title: string;
  role: string;
  summary: string;
  status: string;
  repo: string;
  commit: string;
  metrics: [Metric, Metric, Metric];
  links: Link[];
  media: Media;
  /** What the status card says when the robot passes. */
  cardLine: string;
  ready: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "maximus-character-rig",
    station: "maximus-character-rig",
    title: "maximus-character-rig",
    role: "Character rig in Python and headless Blender",
    summary:
      "A 152-bone, 13,380-vertex mannequin built by script. Pose-space shape keys remove the collapsed triangles that skinning alone leaves behind, and the same rig folds down to a game export for the browser.",
    status: "Public",
    repo: `${GH}/maximus-character-rig`,
    commit: "3f80961",
    metrics: [
      { label: "Collapsed triangles over 16 test poses", value: "201 to 0", proofUrl: blob("maximus-character-rig", RIG, "evidence/M4_canon_atlas.json") },
      { label: "Game export, 24 joints", value: "188,524 bytes", proofUrl: blob("maximus-character-rig", RIG, "evidence/M6_dual_lod.json") },
      { label: "Procedural walk, 0 collapsed triangles", value: "250 frames", proofUrl: blob("maximus-character-rig", RIG, "evidence/M8_motion_reels.json") },
    ],
    links: [
      { label: "Code", href: `${GH}/maximus-character-rig` },
      { label: "Motion studio", href: STUDIO_URL },
    ],
    media: {
      kind: "model",
      src: "/models/maximus_v2_game_lod1.glb",
      poster: "/media/rig.webp",
      alt: "Maximus mannequin, the 24-joint game export",
      caption: "The 24-joint game export, loaded in this page. Drag to turn it.",
      width: 960,
      height: 720,
    },
    cardLine: "16 poses, 201 collapsed triangles to 0",
    ready: true,
  },
  {
    id: "maximus-garment-physics",
    station: "maximus-garment-physics",
    title: "maximus-garment-physics",
    role: "GPU cloth solve and float64 geometry gates",
    summary:
      "Tools that prepare a garment, drape it on the mannequin and decide whether the result is acceptable. The gates measure edge stretch and penetration and report pass or fail.",
    status: "Public, multi-layer does not pass yet",
    repo: `${GH}/maximus-garment-physics`,
    commit: "bb209ec",
    metrics: [
      { label: "Ringer tee stretch, p99", value: "1.076", proofUrl: blob("maximus-garment-physics", GARMENT, "README.md") },
      { label: "Vertices inside the body", value: "0", proofUrl: blob("maximus-garment-physics", GARMENT, "README.md") },
      { label: "Unit tests from a clean export", value: "58", proofUrl: `${GH}/maximus-garment-physics/tree/${GARMENT}/better_style_engine/02_engine_3d/prototypes` },
    ],
    links: [{ label: "Code", href: `${GH}/maximus-garment-physics` }],
    media: {
      kind: "image",
      src: "/media/garment.webp",
      alt: "White ringer tee draped on the mannequin, beside a view of its edge stretch",
      caption: "Front still and stretch view, from an earlier solve of the same garment.",
      width: 1440,
      height: 470,
    },
    cardLine: "Ringer tee p99 1.076, 0 vertices inside",
    ready: true,
  },
  {
    id: "humanoid-robot",
    station: "humanoid-robot",
    title: "Humanoid-Robot",
    role: "Humanoid rig built and checked with Blender Python",
    summary:
      "A service robot in three bone layers, a read-only QA framework around it, and a web export whose bone positions are compared with Blender in Three.js. It is a digital robot. No physical one was built.",
    status: "Public",
    repo: `${GH}/Humanoid-Robot`,
    commit: "16fe21d",
    metrics: [
      { label: "Bones: 56 deform, 68 mechanism, 60 control", value: "184", proofUrl: blob("Humanoid-Robot", ROBOT, "proof/rig_hierarchy_v20.json") },
      { label: "Tests on the standard library", value: "93", proofUrl: blob("Humanoid-Robot", ROBOT, "README.md") },
      { label: "Worst of 2,296 bone positions, Blender to Three.js", value: "1.79e-6 m", proofUrl: blob("Humanoid-Robot", ROBOT, "proof/evidence_v20/viewer_test.md") },
    ],
    links: [
      { label: "Code", href: `${GH}/Humanoid-Robot` },
      { label: "Proof manifest", href: blob("Humanoid-Robot", ROBOT, "proof/PROOF_MANIFEST.json") },
    ],
    media: {
      kind: "image",
      src: "/media/humanoid.webp",
      motion: "/media/humanoid-wave.webp",
      alt: "Humanoid robot v20, raising its right hand",
      caption: "Version 20. The wave is computed from the frame number, inside the joint limits.",
      width: 960,
      height: 1032,
    },
    cardLine: "184 bones, 93 tests",
    ready: true, // Packet A landed: public 200, CI green at 16fe21d, 11 of 11 proof hashes match (checked 2026-11-24)
  },
  {
    id: "audio-lab",
    station: "audio-lab",
    title: "audio-lab",
    role: "Audio-reactive visuals in Python and TypeScript",
    summary:
      "Python analyses a song, and a browser app plays that analysis through live visuals. The same features drive every scene, so any song works.",
    status: "Public",
    repo: `${GH}/audio-lab`,
    commit: "00911ba",
    metrics: [
      { label: "Python tests passed in CI", value: "341", proofUrl: `${GH}/audio-lab/actions/runs/41382485167/job/125076088478` },
      { label: "Skipped in the same run", value: "47", proofUrl: `${GH}/audio-lab/actions/runs/41382485167/job/125076088478` },
      { label: "Last CI run on main", value: "Green", proofUrl: `${GH}/audio-lab/actions/runs/41382485167` },
    ],
    links: [
      { label: "Code", href: `${GH}/audio-lab` },
      { label: "Open the lab", href: AUDIO_LAB_URL },
    ],
    media: {
      kind: "image",
      src: "/media/audio-lab.webp",
      alt: "Constellation Core, an orbiting planetary visual, while a track plays",
      caption: "Constellation Core, playing the built-in synthetic track.",
      width: 1280,
      height: 900,
    },
    cardLine: "341 tests passed, 47 skipped",
    ready: true,
  },
  {
    id: "better-style-asset-pipeline",
    station: "better-style-asset-pipeline",
    title: "better-style-asset-pipeline",
    role: "Catalogue build, validation and safe publishing",
    summary:
      "The Python side of a live storefront: it builds the catalogue, validates it, and moves each release through candidate, approve, publish and rollback with a typed confirmation.",
    status: "Public",
    repo: `${GH}/better-style-asset-pipeline`,
    commit: "dfa4ad7",
    metrics: [
      { label: "Candidate, approve, publish, rollback", value: "4 steps", proofUrl: blob("better-style-asset-pipeline", PIPELINE, "better_style_engine/01_web_storefront/tools/publishing.py") },
      { label: "Live catalogue answers", value: "HTTP 200", proofUrl: CATALOGUE_URL },
      { label: "Source commit", value: "dfa4ad7", proofUrl: `${GH}/better-style-asset-pipeline/commit/${PIPELINE}` },
    ],
    links: [
      { label: "Code", href: `${GH}/better-style-asset-pipeline` },
      { label: "Live catalogue", href: CATALOGUE_URL },
    ],
    media: {
      kind: "image",
      src: "/media/asset-pipeline.webp",
      alt: "The live catalogue grid that this pipeline publishes",
      caption: "The live catalogue, captured 23 November 2026.",
      width: 1200,
      height: 550,
    },
    cardLine: "Candidate, approve, publish, rollback",
    ready: true,
  },
];

/** The sixth station. Built and passing locally, but it has no public address yet, so nothing to link to. */
export const SIGNAL_PIPELINE = { id: "signal-pipeline", ready: false } as const;

export function assertProjects(projects: Project[]): void {
  for (const p of projects) {
    if (p.metrics.length !== 3) throw new Error(`${p.id}: three numbers are required`);
    for (const m of p.metrics) {
      if (!/^https:\/\/\S+$/.test(m.proofUrl ?? "")) throw new Error(`${p.id}: "${m.label}" has no proofUrl`);
      if (!m.value.trim() || !m.label.trim()) throw new Error(`${p.id}: empty metric`);
    }
  }
}
assertProjects(PROJECTS);

export const READY_PROJECTS = PROJECTS.filter((p) => p.ready);
