"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { modelUrl, type Tier } from "@/lib/gpuTier";
import { NODE } from "@/lib/nodes";
import { ASSEMBLY_YAW, DESK_SHIFT, computePose } from "@/lib/poses";
import { makeNodes, playSequence, type Nodes } from "@/lib/sequences";
import { useSceneStore } from "@/stores/sceneStore";

/** The only correct loader configuration (build spec §2):
 * meshopt decoder wired, no DRACOLoader anywhere, WebP native. */
function loadModel(tier: Exclude<Tier, "none">): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(modelUrl(tier)).then((gltf) => gltf.scene);
}

/**
 * Fur decision tree (§3.5.6) — stop at the first level that reads as soft
 * uniform grey at hero distance:
 *   a: rig + colorSpaces + DPR ≥1.5 (no material change)
 *   b: assign the mobile fur_gray bake to the desktop `Basket Top` (kills the
 *      cream tripo bleed, README item #6) — ribbons stay
 *   c: hide `Plane`, baked-fur look on both tiers
 * QA override: ?fur=a|b|c
 */
// Stop level (§3.5.6): on the verifiable render path (software GPU), the
// desktop MASK ribbons still read as camouflage at levels a–b — so we stop
// at c (hide `Plane`, run the mobile 4K fur_gray bake on both tiers), which
// gives clean uniform grey plush. README item #6 tracks the 3D chat retinting
// the desktop bake so ribbons can return; re-evaluate b on real hardware.
const FUR_TREE_DEFAULT: "a" | "b" | "c" = "c";

function furLevel(): "a" | "b" | "c" {
  if (typeof window === "undefined") return FUR_TREE_DEFAULT;
  const q = new URLSearchParams(window.location.search).get("fur");
  return q === "a" || q === "b" || q === "c" ? q : FUR_TREE_DEFAULT;
}

/** §3.5.6b — the extracted fur_gray set (from the mobile GLB, build-time). */
function applyFurBake(scene: THREE.Object3D): void {
  const top = scene.getObjectByName(NODE.top) as THREE.Mesh | undefined;
  if (!top) return;
  const mat = top.material as THREE.MeshStandardMaterial;
  const tl = new THREE.TextureLoader();
  const load = (file: string, colorSpace: THREE.ColorSpace) => {
    const t = tl.load(`/textures/fur/${file}`);
    t.colorSpace = colorSpace;
    t.flipY = false; // glTF UV convention
    return t;
  };
  mat.map = load("fur_gray_basecolor.webp", THREE.SRGBColorSpace);
  mat.normalMap = load("fur_gray_normal.webp", THREE.NoColorSpace);
  mat.roughnessMap = load("fur_gray_roughness.webp", THREE.NoColorSpace);
  mat.color.set("#ffffff");
  mat.roughness = 1.0;
  mat.needsUpdate = true;
}

/** §3.5.2 — shadows are mandatory; §3.5.1 — verify colorSpaces after load. */
function prepareShadowsAndColor(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mesh.name === NODE.fur) {
      // MASK cards: cast no shadow (chunky artifacts); never touch alpha flags
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    } else if (mesh.name === NODE.desk) {
      mesh.receiveShadow = true; // the clamp's contact shadow lands here
      mesh.castShadow = false;
    } else {
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    }
    // colorSpace verification (GLTFLoader sets these; assert, don't trust)
    if (mat?.map && mat.map.colorSpace !== THREE.SRGBColorSpace) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.needsUpdate = true;
    }
    for (const t of [mat?.normalMap, mat?.roughnessMap, mat?.metalnessMap]) {
      if (t && t.colorSpace !== THREE.NoColorSpace) {
        t.colorSpace = THREE.NoColorSpace;
        mat.needsUpdate = true;
      }
    }
  });
}

/** §3.5.4 — the desk is an anchored plane cropped by the frustum, never a
 * floating slab: stretch it along the edge axis and deepen it, keeping the
 * gripped front edge exactly where the clamp meets it. */
function anchorDesk(scene: THREE.Object3D): void {
  const proxy = scene.getObjectByName(NODE.deskProxy);
  if (!proxy) return;
  const FRONT_EDGE_Z = 0.3557; // world Z of the gripped edge (validated)
  const DEPTH_SCALE = 1.8;
  proxy.scale.x = 3.2;
  proxy.scale.z = DEPTH_SCALE;
  proxy.position.z = FRONT_EDGE_Z * (1 - DEPTH_SCALE);
  // shift the slab along its own length: mass to one side of the clamp, so
  // on screen it enters from the right edge and recedes (never crossing the
  // text column). The clamp still grips well inside the edge.
  proxy.position.x = DESK_SHIFT; // clamp grips near the slab's end — corner mount
}

const DAMP = 5;

export function DeskPawsModel({ tier }: { tier: Exclude<Tier, "none"> }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [nodes, setNodes] = useState<Nodes | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadModel(tier).then((gltfScene) => {
      if (cancelled) return;
      // Fur material guard (§2): MASK / transparent:false / DoubleSide
      // arrive from the GLB — verify, never modify.
      if (process.env.NODE_ENV !== "production") {
        const fur = gltfScene.getObjectByName(NODE.fur) as
          | THREE.Mesh
          | undefined;
        if (fur) {
          const mat = fur.material as THREE.Material;
          console.assert(!mat.transparent, "fur must stay transparent:false");
        }
      }
      prepareShadowsAndColor(gltfScene);
      anchorDesk(gltfScene);
      const level = furLevel();
      if (tier === "desktop" && (level === "b" || level === "c")) {
        applyFurBake(gltfScene);
      }
      if (level === "c") {
        const fur = gltfScene.getObjectByName(NODE.fur);
        if (fur) fur.visible = false;
      }
      if (process.env.NODE_ENV !== "production") {
        console.info(`[fur-tree] level ${level} (tier ${tier})`);
      }
      setScene(gltfScene);
      setNodes(makeNodes(gltfScene));
      useSceneStore.setState({ ready: true });
      // QA probe — only when a forced ?tier= is present (never for visitors);
      // lets composition tooling project node positions to screen space.
      if (new URLSearchParams(window.location.search).has("tier")) {
        (window as unknown as Record<string, unknown>).__dpScene = gltfScene;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tier]);

  // Damped state — lives across frames, composes from rest each frame.
  const damped = useMemo(
    () => ({ dockT: 1, tumble: 0, deskX: 0, idle: 1, magnet: 0 }),
    [],
  );

  useFrame((state, delta) => {
    if (!nodes) return;
    const { sceneId, progress, pointerX } = useSceneStore.getState();
    const pose = computePose(sceneId, progress);

    damped.dockT = THREE.MathUtils.damp(damped.dockT, pose.dockT, DAMP, delta);
    damped.tumble = THREE.MathUtils.damp(damped.tumble, pose.tumble, DAMP, delta);
    damped.deskX = THREE.MathUtils.damp(damped.deskX, pose.deskX, DAMP, delta);
    damped.idle = THREE.MathUtils.damp(damped.idle, pose.idle, DAMP, delta);
    damped.magnet = THREE.MathUtils.damp(
      damped.magnet,
      pose.magnet * pointerX,
      DAMP,
      delta,
    );

    // 1 · the dock sequence composes root+screw from rest (scrub-safe)
    playSequence("dock", nodes, damped.dockT);

    // 2 · rotation layers on the root: idle breathing + magnetism + tumble
    const root = nodes.get(NODE.root);
    const rest = nodes.rest.get(NODE.root);
    if (root && rest) {
      const idleYaw =
        ((1.5 * Math.PI) / 180) *
        Math.sin((state.clock.elapsedTime / 9) * Math.PI * 2) *
        damped.idle;
      const magnetYaw = ((4 * Math.PI) / 180) * damped.magnet;
      // seqDock already reset position/quaternion from rest this frame
      root.rotateY(idleYaw + magnetYaw);
      root.rotateX(damped.tumble);
    }

    // 3 · the desk travels on its own axis (the carry slide-off)
    const deskProxy = nodes.get(NODE.deskProxy);
    const deskRest = nodes.rest.get(NODE.deskProxy);
    if (deskProxy && deskRest) {
      deskProxy.position.x = deskRest.position.x + damped.deskX;
    }
  });

  if (!scene) return null;
  // Assembly yaw: turns the whole still-life so the clamp plays to camera
  // and the desk enters from the right viewport edge (§3.5.4).
  return <primitive object={scene} rotation-y={ASSEMBLY_YAW} />;
}
