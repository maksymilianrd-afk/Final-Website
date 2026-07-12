/**
 * The ONLY place GLB node names appear as strings (build spec §2, DoD).
 * Names are the binding contract with the shipped assets — verified against
 * both FINAL GLBs (see docs/06_FINAL_VALIDATION_REPORT.md).
 */
export const NODE = {
  root: "product_root",
  top: "Basket Top",
  bottom: "Basket Bottom",
  base: "Base Structure.001",
  screw: "Screw.001",
  /** DESKTOP TIER ONLY — always access via optional lookup. */
  fur: "Plane",
  deskProxy: "desk_proxy",
  desk: "Desk",
  anno: (i: 1 | 2 | 3 | 4) => `annotation_0${i}` as const,
} as const;

/** Placement guarantees the choreography may hard-code against (02 §3):
 * meters · basket outer Ø 0.40 m · +Y up · clamp faces +Z ·
 * world origin = dock point (top-plate underside ↔ desk surface plane). */
export const PLACEMENT = {
  basketDiameter: 0.4,
  dockPlateTopY: 0.006,
} as const;
