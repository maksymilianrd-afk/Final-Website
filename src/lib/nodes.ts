/**
 * The ONLY place GLB node names appear as strings (build spec §2, DoD).
 *
 * IMPORTANT: three.js GLTFLoader sanitizes node names on import via
 * PropertyBinding.sanitizeNodeName — spaces become underscores and dots are
 * stripped. The names below are the RUNTIME names; the authored names from
 * 02_3D_MODEL_SPEC §2 are kept alongside for traceability:
 *
 *   authored (GLB)          runtime (three.js)
 *   ─────────────────────   ──────────────────
 *   product_root            product_root
 *   Basket Top              Basket_Top
 *   Basket Bottom           Basket_Bottom
 *   Base Structure.001      Base_Structure001
 *   Screw.001               Screw001
 *   Plane (desktop only)    Plane
 *   desk_proxy / Desk       desk_proxy / Desk
 *   annotation_01..04       annotation_01..04
 */
export const NODE = {
  root: "product_root",
  top: "Basket_Top",
  bottom: "Basket_Bottom",
  base: "Base_Structure001",
  screw: "Screw001",
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
