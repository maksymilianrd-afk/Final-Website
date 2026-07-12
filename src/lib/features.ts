/**
 * Feature flags — build spec §4.6, §10.
 * Flip only when the blocking asset/work lands; no layout changes required.
 */
export const FEATURES = {
  /** Blocked: `Base Structure.001` merges clamp + frame (02_3D_MODEL_SPEC §5.1).
   * Scene 09's fold coda ships copy-only until the 3D chat splits the object
   * and delivers a `fold` clip. */
  fold3D: false,
  /** Phase 2 flips this: mounts the persistent WebGL canvas. */
  stage3D: false,
  /** Phase 3 quality gate: desk surface ritual (walnut→oak→marble→metal). */
  deskRitual: false,
} as const;
