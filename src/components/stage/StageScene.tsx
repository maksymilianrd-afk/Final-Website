"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import type { Tier } from "@/lib/gpuTier";
import { computePose } from "@/lib/poses";
import { useSceneStore } from "@/stores/sceneStore";
import { DeskPawsModel } from "./DeskPawsModel";

const DAMP = 5;

/**
 * The rendering rig — Build Spec §3.5 (v2.1), blocking requirements:
 * IBL studio environment (procedural Lightformers — no network HDRI),
 * warm key from upper-left with soft shadows, cool-neutral fill, no rim.
 * Per-scene changes touch intensity only; the rig itself never changes.
 */
export function StageScene({ tier }: { tier: Exclude<Tier, "none"> }) {
  const camera = useThree((s) => s.camera);
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("tier")
  ) {
    (window as unknown as Record<string, unknown>).__dpCamera = camera;
  }
  const target = useRef(new THREE.Vector3(0.05, -0.05, 0.12));
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);

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

    // studio ↔ night: per-scene intensity only (§3.5.1)
    const l = pose.light;
    if (keyRef.current)
      keyRef.current.intensity = THREE.MathUtils.damp(
        keyRef.current.intensity,
        2.0 * l,
        DAMP,
        delta,
      );
    if (fillRef.current)
      fillRef.current.intensity = THREE.MathUtils.damp(
        fillRef.current.intensity,
        0.35 * Math.max(l, 0.3),
        DAMP,
        delta,
      );
  });

  return (
    <>
      {/* §3.5.1 — IBL: procedural studio (self-contained, no HDRI fetch) */}
      <Environment resolution={256} environmentIntensity={0.55}>
        {/* big soft overhead panel */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#fff8ef"
          position={[0, 4, 0]}
          rotation-x={Math.PI / 2}
          scale={[8, 8, 1]}
        />
        {/* warm key panel, upper-left front */}
        <Lightformer
          form="rect"
          intensity={2.8}
          color="#ffeeda"
          position={[-3, 2.5, -2.5]}
          target={[0, 0, 0]}
          scale={[4, 3, 1]}
        />
        {/* cool-neutral bounce, camera-right */}
        <Lightformer
          form="rect"
          intensity={1.1}
          color="#f0f1f4"
          position={[3.5, 0.8, -1.5]}
          target={[0, 0, 0]}
          scale={[3, 2.5, 1]}
        />
        {/* warm floor bounce off the bone field */}
        <Lightformer
          form="circle"
          intensity={0.8}
          color="#efe5d6"
          position={[0, -3, 0]}
          rotation-x={-Math.PI / 2}
          scale={[7, 7, 1]}
        />
      </Environment>

      {/* §3.5.1 — warm key, upper-left (camera side), soft shadows */}
      <directionalLight
        ref={keyRef}
        position={[-2.5, 3.5, -2.5]}
        intensity={2.0}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-0.8, 0.8, 0.8, -0.8, 0.5, 8]}
        />
      </directionalLight>

      {/* fill from camera-right, cool-neutral, no shadows, no rim (§3.5.1) */}
      <directionalLight
        ref={fillRef}
        position={[2.2, 0.9, -1.6]}
        intensity={0.35}
        color="#eef0f3"
      />

      {/* §3.5.2 — the broader soft pool under the basket's overhang */}
      <ContactShadows
        position={[0.1, -0.36, 0.05]}
        scale={1.6}
        far={0.5}
        blur={2.8}
        opacity={0.32}
        resolution={512}
        frames={Infinity}
        color="#3a2f26"
      />

      <DeskPawsModel tier={tier} />
    </>
  );
}
