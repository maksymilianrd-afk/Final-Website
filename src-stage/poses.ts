/**
 * The pose table (build spec §3 + §3.5.3): one entry per scene, interpolated
 * inside scenes by trigger progress. A single useFrame damps toward these
 * values — the "weighted dolly". All positions in meters, world origin =
 * dock point. Poses are authored against the HF-P01 reference (§3.5.3).
 */

/** Yaw of the whole still-life (product + desk) so the clamp plays to
 * camera and the desk enters from the right viewport edge, receding with
 * gentle perspective (§3.5.4). Mirrored handedness: basket reaches left
 * toward the headline, desk mass sweeps right. */
export const ASSEMBLY_YAW = qp("yaw", -1.35);

/** Desk slide along its own length (see anchorDesk). */
export const DESK_SHIFT = qp("shift", -0.55);

/** Dev/QA-only numeric override via query param (?yaw=…&shift=…&cx=…). */
export function qp(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = new URLSearchParams(window.location.search).get(name);
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export type StagePose = {
  camPos: [number, number, number];
  camTarget: [number, number, number];
  /** key light multiplier: 1 = studio bone, ~0.15 = night wings */
  light: number;
  /** desk_proxy X offset: 0 docked · −1.2 off-stage */
  deskX: number;
  /** forward tumble of product_root, radians */
  tumble: number;
  /** idle yaw weight 0..1 (cross-fades out when a sequence owns the root) */
  idle: number;
  /** hover magnetism weight (Scene 01 only) */
  magnet: number;
  /** dock sequence t (0 = approach pose, 1 = locked) */
  dockT: number;
  /** canvas element opacity — the stage hands off to the DOM at Scene 04 */
  canvasOpacity: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const l3 = (
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const seg = (t: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (t - a) / (b - a)));

/** Scene 01 rest (v2.1 hero): warm still-life, eye-level-plus, clamp fully
 * legible toward camera, desk anchored right, basket cantilevering left
 * toward the headline — text ≤46vw, basket left extent ≥48vw (§3.5.5). */
const HERO: Pick<StagePose, "camPos" | "camTarget"> = {
  camPos: [qp("cx", 0.32), qp("cy", 0.4), qp("cz", -1.02)],
  camTarget: [qp("tx", 0.09), qp("ty", -0.02), qp("tz", 0.05)],
};

/** Contained mode (mobile / reduced-motion): the product framed centered in
 * the hero box, front ¾, clamp legible. No scroll choreography — just this. */
export const HERO_CONTAINED: Pick<StagePose, "camPos" | "camTarget"> = {
  camPos: [-0.26, 0.2, -0.78],
  camTarget: [0.04, 0.02, 0.06],
};

export function computePose(sceneId: number, progress: number): StagePose {
  switch (sceneId) {
    case 1: {
      // progress = hero scroll-out: the carry. Desk slides off, the basket
      // tumbles forward; the night dip belongs to Scene 02.
      const p = progress;
      return {
        camPos: l3(HERO.camPos, [0.38, 0.42, -1.35], p),
        camTarget: l3(HERO.camTarget, [-0.02, -0.02, 0.05], p),
        light: lerp(1, 0.7, p),
        deskX: -1.2 * seg(p, 0.05, 0.6),
        tumble: -0.85 * seg(p, 0.15, 1),
        idle: 1,
        magnet: p < 0.05 ? 1 : 0,
        dockT: 1,
        canvasOpacity: 1,
      };
    }
    case 2: {
      // Waiting in the wings: far frame-right, small, dim, still breathing.
      return {
        camPos: [0.4, 0.14, -1.75],
        camTarget: [-0.48, -0.06, 0.02],
        light: 0.15,
        deskX: -1.2,
        tumble: -0.15,
        idle: 1,
        magnet: 0,
        dockT: 1,
        canvasOpacity: 1,
      };
    }
    case 3: {
      // The Turn (pinned, scrubbed): desk glides in, then the dock.
      const p = progress;
      const deskIn = seg(p, 0, 0.14);
      const dockT = seg(p, 0.14, 0.97);
      // camera: heroic wide → drop below the edge for the screw (§ Scene 03)
      const drop = seg(p, 0.5, 0.9);
      return {
        camPos: l3([0.72, 0.2, -0.78], [0.55, -0.3, -0.48], drop),
        camTarget: l3([0.05, -0.04, 0.16], [0.0, -0.09, 0.22], drop),
        light: lerp(0.7, 1, seg(p, 0, 0.25)),
        deskX: -1.2 * (1 - deskIn),
        tumble: 0,
        idle: 1 - seg(p, 0, 0.1), // sequence takes the root
        magnet: 0,
        dockT,
        canvasOpacity: 1,
      };
    }
    default: {
      // Scene 04+ — Phase 3 takes over; the stage bows out over 400ms.
      return {
        camPos: [0.55, -0.3, -0.48],
        camTarget: [0.0, -0.09, 0.22],
        light: 1,
        deskX: 0,
        tumble: 0,
        idle: 0.5,
        magnet: 0,
        dockT: 1,
        canvasOpacity: 0,
      };
    }
  }
}

/** Background color per scene — the fixed z-0 layer the sections reveal. */
export const SCENE_BG: Record<number, string> = {
  1: "#EDE7DE", // bone
  2: "#0E0F14", // night
  3: "#EDE7DE",
  4: "#E3DACC", // bone-deep
  5: "#0E0F14",
  6: "#EDE7DE",
  7: "#0E0F14",
  8: "#E3DACC",
  9: "#EDE7DE",
  10: "#EDE7DE",
  11: "#EDE7DE",
};
