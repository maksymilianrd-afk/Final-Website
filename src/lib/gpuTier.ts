/**
 * Asset tier selection — build spec §2 / 02b, implemented verbatim.
 * Run once, before any GLB fetch. Exactly one file is fetched per session;
 * never hot-swap tiers mid-session.
 */
import { getGPUTier } from "detect-gpu";

export type Tier = "desktop" | "mobile" | "none";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

let cached: Promise<Tier> | null = null;

export function pickTier(): Promise<Tier> {
  cached ??= (async (): Promise<Tier> => {
    if (!hasWebGL()) return "none"; // poster-frame site, no GLB fetch
    try {
      const { tier, isMobile } = await getGPUTier();
      const lowMem = (navigator.deviceMemory ?? 8) <= 4;
      return isMobile || tier < 2 || lowMem ? "mobile" : "desktop";
    } catch {
      return "mobile"; // detection failure → mobile
    }
  })();
  return cached;
}

export function modelUrl(tier: Exclude<Tier, "none">): string {
  return `/models/deskpaws_${tier}_FINAL.glb`;
}

/** Inject after first paint: preload exactly the chosen file. */
export function preloadModel(tier: Exclude<Tier, "none">): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "fetch";
  link.crossOrigin = "anonymous";
  link.href = modelUrl(tier);
  document.head.appendChild(link);
}

declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}
