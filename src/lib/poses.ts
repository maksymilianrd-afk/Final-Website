/**
 * The pose table (build spec §3): one entry per scene, interpolated inside
 * scenes by trigger progress. A single useFrame damps toward these values —
 * the "weighted dolly". All positions in meters, world origin = dock point.
 *
 * Screen-space note: the camera sits on the −Z side looking toward +Z, so
 * with +Y up, world −X maps to screen-right. Raising the target's X shifts
 * the product toward screen-right.
 */

export type StagePose = {
  camPos: [number, number, number];
  camTarget: [number, number, number];
  /** key light multiplier: 1 = studio bone, ~0.15 = night wings */
  light: number;
  /** desk_proxy X offset: 0 docked · −0.9 off-stage left */
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

/** Scene 01 rest composition: ¾ hero from slightly above (the photo
 * library's angle), product in the right half, docked. */
const HERO: Pick<StagePose, "camPos" | "camTarget"> = {
  camPos: [-0.66, 0.35, -0.84],
  camTarget: [0.17, -0.07, 0.2],
};

export function computePose(sceneId: number, progress: number): StagePose {
  switch (sceneId) {
    case 1: {
      // progress = hero scroll-out: the carry. Desk slides off, the basket
      // tumbles forward, light falls toward night.
      const p = progress;
      return {
        camPos: l3(HERO.camPos, [-0.6, 0.4, -1.05], p),
        camTarget: l3(HERO.camTarget, [0.08, -0.04, 0.16], p),
        light: lerp(1, 0.7, p),
        deskX: -0.95 * seg(p, 0.05, 0.6),
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
        camPos: [-0.35, 0.12, -1.55],
        camTarget: [0.52, -0.05, 0.15],
        light: 0.15,
        deskX: -0.95,
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
        camPos: l3(
          [-0.78, 0.22, -0.68],
          [-0.66, -0.3, -0.3],
          drop,
        ),
        camTarget: l3([-0.07, -0.02, 0.24], [-0.02, -0.05, 0.34], drop),
        light: lerp(0.35, 1, seg(p, 0, 0.25)),
        deskX: -0.95 * (1 - deskIn),
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
        camPos: [-0.66, -0.3, -0.3],
        camTarget: [-0.02, -0.05, 0.34],
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
