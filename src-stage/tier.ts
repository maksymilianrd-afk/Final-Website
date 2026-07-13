/** Lean tier picker (theme-appropriate — no detect-gpu benchmark fetch).
 * One GLB per session; never hot-swap. Heuristic: mobile UA / low memory /
 * narrow viewport → mobile tier; no WebGL → poster-only. */
export type Tier = "desktop" | "mobile" | "none";

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export function pickTier(): Tier {
  if (!hasWebGL()) return "none";
  const ua = navigator.userAgent;
  const mobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const lowMem = typeof deviceMemory === "number" && deviceMemory <= 4;
  if (mobileUA || lowMem || window.innerWidth < 900) return "mobile";
  return "desktop";
}

export function modelUrl(base: string, tier: Exclude<Tier, "none">): string {
  return base.replace(/\/$/, "") + "/deskpaws_" + tier + "_FINAL.glb";
}
