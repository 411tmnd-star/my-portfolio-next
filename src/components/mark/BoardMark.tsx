"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { Box3, Vector3 } from "three";

export const BOARD_MARK_URL = "/models/411_board.glb";
const FIT = [2.1, 1.0, 0.3] as const;

/**
 * Slot for the circuit-board 411. A stub today: the GLB has not been modelled, nothing imports this until
 * ACTIVE_MARK is "board", and then it fits whatever is in the file to the mark contract.
 */
export default function BoardMark() {
  const { scene } = useGLTF(BOARD_MARK_URL, "/draco/", true);
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const centre = box.getCenter(new Vector3());
    const k = Math.min(FIT[0] / size.x, FIT[1] / size.y, FIT[2] / size.z);
    return { scale: k, offset: centre.multiplyScalar(-k) };
  }, [scene]);
  return (
    <group position={offset}>
      <primitive object={scene.clone()} scale={scale} />
    </group>
  );
}
