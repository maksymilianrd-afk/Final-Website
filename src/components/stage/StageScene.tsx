"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Tier } from "@/lib/gpuTier";
import { computePose } from "@/lib/poses";
import { useSceneStore } from "@/stores/sceneStore";
import { DeskPawsModel } from "./DeskPawsModel";

const DAMP = 5;

/**
 * Camera rig + studio lighting. One useFrame damps camera and light toward
 * the pose table — the weighted dolly settling (§1.3).
 */
export function StageScene({ tier }: { tier: Exclude<Tier, "none"> }) {
  const camera = useThree((s) => s.camera);
  const target = useRef(new THREE.Vector3(0.09, -0.06, 0.2));
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame((_, delta) => {
    const { sceneId, progress } = useSceneStore.getState();
    const pose = computePose(sceneId, progress);

    const [px, py, pz] = pose.camPos;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px, DAMP, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py, DAMP, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, pz, DAMP, delta);

    const [tx, ty, tz] = pose.camTarget;
    target.current.x = THREE.MathUtils.damp(target.current.x, tx, DAMP, delta);
    target.current.y = THREE.MathUtils.damp(target.current.y, ty, DAMP, delta);
    target.current.z = THREE.MathUtils.damp(target.current.z, tz, DAMP, delta);
    camera.lookAt(target.current);

    // studio ↔ night — the wings dim, the actor keeps breathing
    const l = pose.light;
    if (keyRef.current)
      keyRef.current.intensity = THREE.MathUtils.damp(
        keyRef.current.intensity,
        2.1 * l,
        DAMP,
        delta,
      );
    if (fillRef.current)
      fillRef.current.intensity = THREE.MathUtils.damp(
        fillRef.current.intensity,
        0.8 * l,
        DAMP,
        delta,
      );
    if (hemiRef.current)
      hemiRef.current.intensity = THREE.MathUtils.damp(
        hemiRef.current.intensity,
        0.75 * Math.max(l, 0.25),
        DAMP,
        delta,
      );
  });

  return (
    <>
      {/* key from upper-left (matches the photo library, HF brief §1) */}
      <directionalLight ref={keyRef} position={[-1.4, 2.2, -1.1]} intensity={2.1} />
      <directionalLight ref={fillRef} position={[1.2, 0.6, -0.8]} intensity={0.8} />
      <hemisphereLight
        ref={hemiRef}
        color={"#f4efe6"}
        groundColor={"#8a7360"}
        intensity={0.75}
      />
      <DeskPawsModel tier={tier} />
    </>
  );
}
