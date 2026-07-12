"use client";

import { create } from "zustand";
import type { Tier } from "@/lib/gpuTier";

/**
 * The single source of scroll truth (build spec §3): ScrollTrigger writes
 * `{sceneId, progress}`; the stage's useFrame reads it and damps toward the
 * pose table. Nothing else communicates between DOM and canvas.
 */
type SceneState = {
  /** null until pickTier resolves; "none" means the stage never mounts */
  tier: Tier | null;
  /** stage is mounted and choreography is live (webgl + motion allowed) */
  active: boolean;
  /** the GLB is decoded and the actor is on stage — posters hand off */
  ready: boolean;
  sceneId: number;
  /** 0..1 within the current scene's trigger range */
  progress: number;
  /** normalized pointer, -1..1, for the Scene 01 hover magnetism */
  pointerX: number;
};

export const useSceneStore = create<SceneState>(() => ({
  tier: null,
  active: false,
  ready: false,
  sceneId: 1,
  progress: 0,
  pointerX: 0,
}));
