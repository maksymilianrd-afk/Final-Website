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
  /** explode sequence t (Scene 04 centerpiece; 0 = assembled) */
  explodeT: number;
  /** knob-turn sequence t (Scene 09; 0 = rest) */
  knobT: number;
  /** canvas element opacity — the product features in 1–4/9/11, hands the
   * frame to DOM media in the content scenes (5–8, 10). */
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
export const HERO: Pick<StagePose, "camPos" | "camTarget"> = {
  // Product sits LEFT of centre (~42% of width) with the desk it clamps to
  // filling the right of the frame — both read at once. NOTE the handedness:
  // LOWER tx moves the product LEFT (verified by projection). Tune live with
  // ?tx (lower = further left) / ?cz (more negative = pulled back) / ?fov.
  camPos: [qp("cx", 0.35), qp("cy", 0.34), qp("cz", -1.7)],
  camTarget: [qp("tx", -0.08), qp("ty", -0.02), qp("tz", 0.06)],
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
        camPos: l3(HERO.camPos, [0.42, 0.46, -2.1], p),
        camTarget: l3(HERO.camTarget, [-0.1, -0.02, 0.05], p),
        light: lerp(1, 0.7, p),
        deskX: -1.2 * seg(p, 0.05, 0.6),
        tumble: -0.85 * seg(p, 0.15, 1),
        idle: 1,
        magnet: p < 0.05 ? 1 : 0,
        dockT: 1,
        explodeT: 0,
        knobT: 0,
        canvasOpacity: 1,
      };
    }
    case 2: {
      // Waiting in the wings (doc 13 Fix 5): pulled way back, aimed hard left so
      // the product slides to the far-right edge — a dim, half-glimpsed
      // silhouette that doesn't fight the headline, not a lit basket centre-stage.
      return {
        camPos: [0.95, 0.2, -2.3],
        camTarget: [-1.15, -0.05, 0.02],
        light: 0.16,
        deskX: -1.2,
        tumble: -0.15,
        idle: 1,
        magnet: 0,
        dockT: 1,
        explodeT: 0,
        knobT: 0,
        canvasOpacity: 0.55,
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
        explodeT: 0,
        knobT: 0,
        canvasOpacity: 1,
      };
    }
    case 4: {
      // The centerpiece (§4.2 / doc 13 Fix 6): pinned. The camera RETREATS as
      // the parts separate so the whole stack is always framed — never
      // overflowing the viewport. explodeT holds fully-apart mid-scene for
      // inspection, then reassembles right at the end so 04→05 hands off clean;
      // scrolling back up also rebuilds it.
      const p = progress;
      const exploded = seg(p, 0.25, 0.75);
      const eDown = seg(p, 0.85, 1.0);
      const dist = -0.62 - 0.55 * exploded; // pull back to contain the explosion
      return {
        camPos: l3([0.34, 0.06, -0.62], [0.1, 0.02, dist], exploded),
        camTarget: l3([0.03, 0.0, 0.14], [0.03, 0.04, 0.1], exploded),
        light: 1,
        deskX: 0,
        tumble: 0,
        idle: 0, // the sequence owns the root
        magnet: 0,
        dockT: 1,
        explodeT: exploded * (1 - eDown),
        knobT: 0,
        canvasOpacity: 1,
      };
    }
    case 9: {
      // How it works: drop low and close on the star knob; the screw turns
      // through its detents as you scroll (§4.3).
      const p = progress;
      const cin = seg(p, 0, 0.25);
      return {
        camPos: l3([0.4, -0.15, -0.55], [0.32, -0.2, -0.44], cin),
        camTarget: l3([0.05, -0.07, 0.18], [0.06, -0.09, 0.2], cin),
        light: 1,
        deskX: 0,
        tumble: 0,
        idle: 0,
        magnet: 0,
        dockT: 1,
        explodeT: 0,
        knobT: p,
        canvasOpacity: 1,
      };
    }
    case 11: {
      // The finale: the product returns to its hero pose beside the CTA,
      // breathing, for the photo match-cut.
      return {
        camPos: HERO.camPos,
        camTarget: HERO.camTarget,
        light: 1,
        deskX: 0,
        tumble: 0,
        idle: 1,
        magnet: 0,
        dockT: 1,
        explodeT: 0,
        knobT: 0,
        canvasOpacity: 1,
      };
    }
    default: {
      // Content scenes (5–8, 10): the product bows out over 400ms and the DOM
      // media (cat films, reviews, UGC) owns the frame.
      return {
        camPos: [0.46, 0.1, -0.66],
        camTarget: [0.02, 0.02, 0.13],
        light: 1,
        deskX: 0,
        tumble: 0,
        idle: 0.4,
        magnet: 0,
        dockT: 1,
        explodeT: 0,
        knobT: 0,
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
