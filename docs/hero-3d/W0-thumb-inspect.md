# Phase W0 — Thumb (QA-003): inspect and plan only

**Project:** `Humanoid-Robot` (Blender 5.2 via Blender MCP). Follow that repo's
`CLAUDE.md`. Its workflow is INSPECT → PLAN → IMPLEMENT → VALIDATE → REPORT;
**this phase is INSPECT + PLAN only.**

**Why:** the portfolio hero waves with one hand in close-up. QA-003
(`blender/inspection/summary.md`, run 2026-10-13) found that one thumb sits
beside the Little finger instead of the Index. The owner has approved fixing
it before the web export.

## Hard rules for this phase

- Open `blender/robot_armature_v15.blend`. **Do not save it.** It is the
  fallback and stays byte-identical (SHA-256 starts `0946c7d4…`). Verify the
  hash before and after, and report both.
- No writes to bones, meshes, constraints or materials. Read-only `bpy`
  introspection, plus renders from temporary cameras that you delete before
  you finish.
- Never select by selection state or active object. Use explicit names only.

## Steps

1. **Identify the wrong hand.** For both hands, print in world space:
   - every thumb-chain bone (DEF, MECH and CTRL) with head and tail;
   - each one's parent, constraints (type, target, subtarget, owner/target
     space, influence) and rotation limits;
   - the thumb meshes bound to them (`411_Thumb_*`, `411_ThumbJoint_*`):
     vertex group name, object location and bounding-box centre.

   Also print the DEF Index and Little MCP head positions for each hand.
   Then state which hand's thumb is nearer its Little finger. That is the
   wrong hand.
2. **Compare against the good hand mirrored.** Mirror the good hand's
   thumb-chain bone heads and tails across X = 0 (world). Print the delta
   to the wrong hand's actual positions, per bone. Do the same with the
   thumb mesh bounding-box centres.
3. **Note the known size mismatch.** `phase_skinning.md` records that the two
   thumb meshes use different datablocks and differ by about 26% in width and
   41% in height. Print both datablock names and their dimensions.
4. **Render, then stop.** EEVEE, 1000 px square, saved to `blender/inspection/w0/`:
   - `w0_hands_front.png`: both hands, from the front (−Y looking +Y)
   - `w0_hand_wrong_palm.png`: the wrong hand, close-up, from the palm side
   - `w0_hand_good_palm.png`: the good hand, same framing, mirrored camera
   - `w0_hands_top.png`: both hands, from above
5. **Write the plan, don't run it.** Save `blender/inspection/w0/W0_PLAN.md`
   with the smallest correct rebuild of the wrong thumb by mirroring the good
   one: bones, constraint targets and the mesh. Use the datablock of the good
   thumb so both hands end up identical. The plan must:
   - list every name that changes or is created;
   - list every constraint that has to be retargeted;
   - say how the result will be validated: thumb adjacency re-measured, the
     curl-to-30° test from `anim_showcase_10s.md` on both hands, and a
     before/after render pair from the same cameras;
   - name the output file `robot_armature_v16.blend`.

## Report back (paste the summary; the images are verified separately)

- Which hand is wrong, with the measured distances.
- The table of mirrored deltas.
- The four render paths.
- The `W0_PLAN.md` path.
- The v15 hash before and after.

**Then stop and wait.** Do not start the rebuild. W0b (the fix) is issued
only after the renders have been checked.
