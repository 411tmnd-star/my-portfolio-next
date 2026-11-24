/**
 * Humanoid-Robot v20 for the diorama. It has no walk cycle, so it stands still on a carrier: the 122 skinned
 * meshes are baked once at their rest pose into one plain mesh per material. No triangle is removed.
 */
import {
  Box3, BufferAttribute, BufferGeometry, Color, Group, Material, Matrix3, Mesh, MeshStandardMaterial, Object3D,
  SkinnedMesh, Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const ROBOT_URL = "/models/robot_v20_meshopt.glb";
export const ROBOT_HEIGHT = 1.75;

function bakedGeometry(mesh: Mesh): BufferGeometry {
  const src = mesh.geometry;
  const count = src.getAttribute("position").count;
  const out = new Float32Array(count * 3);
  const v = new Vector3();
  for (let i = 0; i < count; i++) {
    mesh.getVertexPosition(i, v); // reads quantised attributes and applies the skin
    v.applyMatrix4(mesh.matrixWorld).toArray(out, i * 3);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(out, 3));
  if (mesh instanceof SkinnedMesh || !src.getAttribute("normal")) {
    g.setIndex(src.index ? new BufferAttribute(Uint32Array.from(src.index.array), 1) : null);
    g.computeVertexNormals();
  } else {
    const normal = src.getAttribute("normal");
    const m = new Matrix3().getNormalMatrix(mesh.matrixWorld);
    const n = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) v.fromBufferAttribute(normal, i).applyMatrix3(m).normalize().toArray(n, i * 3);
    g.setAttribute("normal", new BufferAttribute(n, 3));
    g.setIndex(src.index ? new BufferAttribute(Uint32Array.from(src.index.array), 1) : null);
  }
  return g;
}

/** Physical layers the diorama does not need (clearcoat, anisotropy) are dropped; colours and emission stay. */
function plainMaterial(source: Material): MeshStandardMaterial {
  const s = source as MeshStandardMaterial;
  return new MeshStandardMaterial({
    name: s.name,
    color: s.color ?? new Color("#888"),
    roughness: Math.max(0.35, s.roughness ?? 0.6),
    metalness: Math.min(0.3, s.metalness ?? 0),
    emissive: s.emissive ?? new Color(0),
    emissiveIntensity: Math.min(1.6, s.emissiveIntensity ?? 0),
  });
}

export function bakeStatic(scene: Object3D): Group {
  scene.updateMatrixWorld(true);
  const byMaterial = new Map<Material, BufferGeometry[]>();
  scene.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    if (o instanceof SkinnedMesh) o.skeleton.update();
    const material = Array.isArray(o.material) ? o.material[0] : o.material;
    const list = byMaterial.get(material) ?? [];
    list.push(bakedGeometry(o));
    byMaterial.set(material, list);
  });
  const group = new Group();
  for (const [material, parts] of byMaterial) {
    const merged = parts.length > 1 ? mergeGeometries(parts) : parts[0];
    const mesh = new Mesh(merged, plainMaterial(material));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.heavy = true;
    mesh.name = `robot-${material.name}`;
    group.add(mesh);
  }
  const box = new Box3().setFromObject(group);
  const size = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  const k = ROBOT_HEIGHT / size.y;
  group.scale.setScalar(k);
  group.position.set(-centre.x * k, -box.min.y * k, -centre.z * k);
  const holder = new Group();
  holder.name = "robot-v20";
  holder.add(group);
  return holder;
}

export async function loadRobot(url = ROBOT_URL): Promise<Group> {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  return bakeStatic(gltf.scene);
}
