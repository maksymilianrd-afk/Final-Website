"use client";

import { useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { modelUrl, type Tier } from "@/lib/gpuTier";
import { NODE } from "@/lib/nodes";
import { computePose } from "@/lib/poses";
import { makeNodes, playSequence, type Nodes } from "@/lib/sequences";
import { useSceneStore } from "@/stores/sceneStore";

/** The only correct loader configuration (build spec §2):
 * meshopt decoder wired, no DRACOLoader anywhere, WebP native. */
function loadModel(tier: Exclude<Tier, "none">): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(modelUrl(tier)).then((gltf) => gltf.scene);
}

const DAMP = 5; // ≈ the spec's 0.08/frame lerp, framerate-independent

export function DeskPawsModel({ tier }: { tier: Exclude<Tier, "none"> }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [nodes, setNodes] = useState<Nodes | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadModel(tier).then((gltfScene) => {
      if (cancelled) return;
      // Fur material guard (§2): alphaTest≈0.15 / transparent:false /
      // DoubleSide arrive from the GLB — verify, never modify.
      if (process.env.NODE_ENV !== "production") {
        const fur = gltfScene.getObjectByName(NODE.fur) as
          | THREE.Mesh
          | undefined;
        if (fur) {
          const mat = fur.material as THREE.Material;
          console.assert(!mat.transparent, "fur must stay transparent:false");
        }
      }
      setScene(gltfScene);
      setNodes(makeNodes(gltfScene));
      useSceneStore.setState({ ready: true });
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

    // 3 · the desk fragment travels on its own axis
    const deskProxy = nodes.get(NODE.deskProxy);
    const deskRest = nodes.rest.get(NODE.deskProxy);
    if (deskProxy && deskRest) {
      deskProxy.position.x = deskRest.position.x + damped.deskX;
    }
  });

  if (!scene) return null;
  return <primitive object={scene} />;
}
