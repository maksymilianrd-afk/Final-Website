"use client";

import type { ReactNode } from "react";
import { useSceneStore } from "@/stores/sceneStore";

/**
 * Wraps a Static Cut stand-in (poster, keyframe placeholder) that the live
 * stage replaces. Keeps layout space; fades out when the actor is on stage
 * (spec §6 Scene 01: poster under canvas until GLB ready).
 */
export function StageAware({ children }: { children: ReactNode }) {
  const ready = useSceneStore((s) => s.ready);
  return (
    <div
      aria-hidden={ready || undefined}
      className="transition-opacity duration-500"
      style={{ opacity: ready ? 0 : 1 }}
    >
      {children}
    </div>
  );
}
