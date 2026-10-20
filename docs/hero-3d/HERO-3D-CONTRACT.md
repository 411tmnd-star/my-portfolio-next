# Hero 3D — Interface Contract (Blender → web)

What the Blender side must deliver for step 3 to start. The web side builds
against exactly these names; if anything here has to change, change this file
first.

## Source

- `Humanoid-Robot/blender/robot_armature_v15.blend` is the **untouchable
  fallback**. All work happens on Save-As copies (`v16`, `v17`, …).
- Rig facts (QA run 2026-10-13): 184 bones (56 DEF / 68 MECH / 60 CTRL), root
  `DEF_Pelvis`, 78 body meshes, ~15.8k vertices, rigid single-bone skinning,
  8 Principled BSDF materials with no textures. Robot faces −Y in Blender
  (→ +Z in glTF, i.e. toward a default three.js camera).

## Deliverables (into `Humanoid-Robot/export/web/`)

| File | What | Budget |
|---|---|---|
| `humanoid.glb` | Body only (no ENV_*, cameras, lights, volumes, backups). DEF bones only. Meshopt or Draco compressed. | ≤ 350 KB |
| `poster.webp` + `poster.png` | Rest/idle pose, transparent or `#0B0E12` background, rendered from the **web camera** below | webp ≤ 60 KB at 900×1100 |
| `poster-mobile.webp` | Same camera, 600×740 | ≤ 30 KB |
| `export_report.json` | Written by the export script: bone count, clip names + durations, material names, vertex count, file size | — |

## Animation clips (glTF animation names, exact)

| Clip | From | Length | Loop | Used when |
|---|---|---|---|---|
| `idle_breathe` | existing `idle_breathe` | 2–5 s | yes | always (base layer) |
| `hello_wave` | existing `hello_sequence` | ~4 s | no | page load, then crossfade to idle |
| `present` | showcase phase 4 (arms forward/out) | ~1.5 s, hold last frame | no | Services in view |
| `point` | **new**, right arm points screen-right, slightly down | ~1.2 s, hold last frame | no | contact / WhatsApp CTA in view |
| `rest_bow` | hello phase 4 (8–12° chest bow) | ~1.5 s | no | Contact in view |

Rules: every clip baked to **DEF bones only**, constraints and IK removed
from the export (glTF keeps no constraints). `hello_sequence` stays untouched
in the `.blend` — `hello_wave` is a baked copy.

## Bones the runtime drives directly

`DEF_Head`, `DEF_Neck` (cursor look-at, clamped ±18° yaw / ±10° pitch,
added on top of whatever clip is playing). Names must survive export unchanged.

## Materials the runtime touches

- The visor/cyan emissive material (`BotCyan`) — the runtime swaps its
  emissive map for a canvas texture to show `HELLO` → `411`, and pulses
  emission for blinks. The visor mesh needs a UV layout that maps the visor
  face to a 0–1 rectangle (if it doesn't have one, W1 adds it).
- All other materials ship as-is (Principled → glTF metallic-roughness).

## Web camera (Blender and three.js must match)

- 35 mm-equivalent, framed knee-up for desktop, full height for mobile poster.
- Recorded in `export_report.json` as position, target, and vertical FOV so
  the R3F `<PerspectiveCamera>` reproduces the poster exactly (the swap from
  poster to 3D must not jump).

## Handoff condition (W1 → step 3)

1. `humanoid.glb` loads in a bare three.js page with no console errors.
2. All 5 clips play; the mesh follows the bones (no part left behind).
3. A Python checker re-reads the `.glb` and confirms: 56 or fewer joints,
   5 clip names exactly as above, `DEF_Head` and `DEF_Neck` present,
   size within budget.
4. Poster and the three.js view at frame 0 of `idle_breathe` line up when
   overlaid.
