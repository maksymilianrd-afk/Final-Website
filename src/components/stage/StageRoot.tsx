"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { pickTier, preloadModel, type Tier } from "@/lib/gpuTier";
import { SCENE_BG } from "@/lib/poses";
import { computePose } from "@/lib/poses";
import { useSceneStore } from "@/stores/sceneStore";
import { ScrollDirector } from "./ScrollDirector";
import { StageScene } from "./StageScene";

/**
 * The persistent stage (build spec §3):
 *   z-0  fixed background layer (scene color direction)
 *   z-10 fixed full-viewport Canvas — the actor
 *   z-20 the DOM scenes (sections turn transparent via body.stage-on)
 *   z-50 grain (already global)
 *
 * Mounts nothing when WebGL is absent or the visitor prefers reduced motion —
 * the Static Cut stays exactly as shipped in Phase 1.
 */
export function StageRoot() {
  const [tier, setTier] = useState<Exclude<Tier, "none"> | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let cancelled = false;
    (async () => {
      // dev/QA override: ?tier=desktop|mobile
      const forced = new URLSearchParams(window.location.search).get("tier");
      const picked =
        forced === "desktop" || forced === "mobile"
          ? forced
          : await pickTier();
      if (cancelled || picked === "none") return;
      preloadModel(picked);
      setTier(picked);
      useSceneStore.setState({ tier: picked, active: true });
      document.body.classList.add("stage-on");
    })();

    return () => {
      cancelled = true;
      document.body.classList.remove("stage-on");
      useSceneStore.setState({ active: false, ready: false });
    };
  }, []);

  // The stage bows out at Scene 04 (Phase 3 takes the centerpiece):
  // drive canvas opacity from the pose table.
  useEffect(() => {
    if (!tier) return;
    const unsub = useSceneStore.subscribe((s) => {
      const el = canvasWrapRef.current;
      if (!el) return;
      const pose = computePose(s.sceneId, s.progress);
      el.style.opacity = String(pose.canvasOpacity);
    });
    return unsub;
  }, [tier]);

  if (!tier) return null;

  return (
    <>
      <div
        ref={backgroundRef}
        aria-hidden
        className="fixed inset-0 z-0"
        style={{ backgroundColor: SCENE_BG[1] }}
      />
      <div
        ref={canvasWrapRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-[400ms]"
      >
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1.5, 2]} // §3.5.6a — fur needs DPR ≥ 1.5
          shadows="soft"
          camera={{ fov: 35, near: 0.01, far: 20, position: [-0.28, 0.22, -1.02] }}
          onCreated={({ gl }) => {
            // §3.5.1 — rendering contract
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <StageScene tier={tier} />
        </Canvas>
      </div>
      <ScrollDirector backgroundRef={backgroundRef} />
    </>
  );
}
