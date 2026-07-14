/**
 * Motion library — code-driven sequences replacing baked clips (build spec §4).
 *
 * Every sequence is a pure function `(nodes, t: 0..1) => void` mutating
 * transforms. Scroll scrubs `t`; sequences are exactly reversible (idempotent
 * at any t, no internal state) and always compose from the REST POSE captured
 * once at load — never from current transforms.
 *
 * Clip-adapter seam (§4.5): `playSequence` prefers a baked AnimationClip of
 * the same name when the GLB ships one; scene components never change when
 * clips land.
 */
import type {
  AnimationMixer,
  Group,
  Object3D,
  Quaternion,
  Vector3,
} from "three";
import { NODE } from "./nodes";

/* ────────────────────────────── rest pose ────────────────────────────── */

export type RestPose = Map<
  string,
  { position: Vector3; quaternion: Quaternion; scale: Vector3 }
>;

/** Capture once, immediately after GLTF load and before any sequence runs. */
export function captureRest(scene: Object3D): RestPose {
  const rest: RestPose = new Map();
  scene.traverse((node) => {
    rest.set(node.name, {
      position: node.position.clone(),
      quaternion: node.quaternion.clone(),
      scale: node.scale.clone(),
    });
  });
  return rest;
}

export type Nodes = {
  scene: Object3D;
  rest: RestPose;
  get: (name: string) => Object3D | undefined;
};

export function makeNodes(scene: Object3D): Nodes {
  const rest = captureRest(scene);
  return {
    scene,
    rest,
    get: (name) => scene.getObjectByName(name) ?? undefined,
  };
}

/** Reset a node to rest, then apply offsets — the compose-from-rest rule. */
function fromRest(nodes: Nodes, name: string): Object3D | undefined {
  const node = nodes.get(name);
  const rest = nodes.rest.get(name);
  if (!node || !rest) return undefined;
  node.position.copy(rest.position);
  node.quaternion.copy(rest.quaternion);
  node.scale.copy(rest.scale);
  return node;
}

/* ─────────────────────────── easing helpers ──────────────────────────── */

/** Mechanical easing, cubic-bezier(0.65, 0, 0.35, 1) approximated for scrub. */
function easeMech(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

/** Remap t into a sub-range [a, b] of the parent timeline. */
function seg(t: number, a: number, b: number): number {
  return clamp01((t - a) / (b - a));
}

/* ──────────────────────────── sequences §4 ───────────────────────────── */

const DETENTS = [0.25, 0.5, 0.75].map((f) => f * 0.9); // holds at 90°/180°/270°
const DETENT_WIDTH = 0.02;

/** Screw rotation with three detents: flatten the curve for Δt at each stop. */
function detentRotation(t: number): number {
  let held = 0;
  for (const d of DETENTS) {
    if (t > d && t < d + DETENT_WIDTH) held += t - d;
    else if (t >= d + DETENT_WIDTH) held += DETENT_WIDTH;
  }
  return clamp01((t - held) / (1 - DETENTS.length * DETENT_WIDTH));
}

/** §4.1 seqDock — Scene 03. Approach → settle → screw 270° w/ detents → settle. */
export function seqDock(nodes: Nodes, t: number): void {
  const root = fromRest(nodes, NODE.root);
  const screw = fromRest(nodes, NODE.screw);
  if (!root) return;

  // t 0→0.55: approach from (+0.25 Z, −0.12 Y), mechanical ease
  const approach = easeMech(seg(t, 0, 0.55));
  root.position.z += 0.25 * (1 - approach);
  root.position.y += -0.12 * (1 - approach);

  // t 0.55→0.6: settle — 2mm overshoot down, single damped bounce back
  const s = seg(t, 0.55, 0.6);
  if (s > 0 && s < 1) {
    root.position.y -= 0.002 * Math.sin(s * Math.PI);
  }

  // t 0.6→0.95: screw 270° with three detents + thread-rise 2.5mm per 90°
  if (screw) {
    const k = detentRotation(seg(t, 0.6, 0.95));
    screw.rotateY(k * Math.PI * 1.5); // 270° about local screw axis
    screw.position.y += k * 3 * 0.0025;
  }

  // t 0.95→1: fur settle impulse is triggered by the caller (furSettle is
  // time-based, not scrub-based); camera micro-shake lives in the rig.
}

/** §4.2 seqExplode — Scene 04 Movement B. Four real objects, staggered. */
export function seqExplode(nodes: Nodes, t: number): void {
  const top = fromRest(nodes, NODE.top);
  const bottom = fromRest(nodes, NODE.bottom);
  const base = fromRest(nodes, NODE.base);
  const screw = fromRest(nodes, NODE.screw);
  const fur = fromRest(nodes, NODE.fur); // desktop only — may be undefined

  const kTop = easeMech(seg(t, 0, 0.35));
  const kBottom = easeMech(seg(t, 0.15, 0.5));
  const kBase = easeMech(seg(t, 0.4, 0.75));
  const kScrew = easeMech(seg(t, 0.6, 1));

  // Tightened spreads (doc 13 Fix 6c): 0.14 m on a 0.40 m basket reads as
  // "blown apart"; ~0.085 reads as a technician's careful disassembly.
  if (top) top.position.y += 0.085 * kTop;
  if (fur) fur.position.y += 0.085 * kTop; // fur ribbons travel with the plush top
  if (bottom) bottom.position.y += 0.035 * kBottom;
  if (base) {
    base.position.z += 0.045 * kBase;
    base.rotateX((-12 * Math.PI) / 180 * kBase);
  }
  if (screw) {
    screw.position.y -= 0.045 * kScrew;
    screw.rotateY(-kScrew * Math.PI * 4); // −720°, unthreads
  }
}

/** §4.3 seqKnob — Scene 09: the screw segment of seqDock remapped to 0..1. */
export function seqKnob(nodes: Nodes, t: number): void {
  seqDock(nodes, 0.6 + clamp01(t) * 0.35);
}

/** §4.4 furSettle — no morph target exists; spring scale.y over 350ms.
 * Returns a per-frame update fn: call with elapsed seconds until it returns false. */
export function furSettle(nodes: Nodes): (elapsed: number) => boolean {
  const DURATION = 0.35;
  const targets = [nodes.get(NODE.top), nodes.get(NODE.fur)].filter(
    (n): n is Object3D => !!n,
  );
  const restScales = targets.map(
    (n) => nodes.rest.get(n.name)?.scale.y ?? n.scale.y,
  );
  return (elapsed: number) => {
    const t = clamp01(elapsed / DURATION);
    // 1 → 0.97 → 1.005 → 1 keyframe spring
    const y =
      t < 0.4
        ? 1 - 0.03 * Math.sin((t / 0.4) * Math.PI)
        : 1 + 0.005 * Math.sin(((t - 0.4) / 0.6) * Math.PI);
    targets.forEach((n, i) => {
      n.scale.y = restScales[i] * y;
    });
    return t < 1;
  };
}

/** §4.7 idle — sine yaw ±1.5°, 9s period. Runs whenever no sequence owns the
 * root; the stage cross-fades it out over 400ms when a scene takes control. */
export function idleYaw(nodes: Nodes, timeSeconds: number, weight = 1): void {
  const root = nodes.get(NODE.root);
  const rest = nodes.rest.get(NODE.root);
  if (!root || !rest) return;
  const yaw =
    ((1.5 * Math.PI) / 180) *
    Math.sin((timeSeconds / 9) * Math.PI * 2) *
    weight;
  root.quaternion.copy(rest.quaternion);
  root.rotateY(yaw);
}

/** §4.6 seqFold — BLOCKED. `Base Structure.001` merges clamp + frame
 * (02 §5.1); a fold cannot be authored until the object is split. Scene 09's
 * fold coda ships copy-only behind FEATURES.fold3D=false. When `Frame.001`
 * lands, implement here and flip the flag — zero layout change. */
export function seqFold(_nodes: Nodes, _t: number): void {
  // TODO(02 §5.1): blocked on the Base Structure.001 clamp/frame split.
}

/* ───────────────────────── clip-adapter seam §4.5 ─────────────────────── */

type SequenceName = "dock" | "explode" | "knob_turn" | "fold";

const CODE_SEQUENCES: Record<
  SequenceName,
  (nodes: Nodes, t: number) => void
> = {
  dock: seqDock,
  explode: seqExplode,
  knob_turn: seqKnob,
  fold: seqFold,
};

export type ClipRig = {
  mixer: AnimationMixer;
  clips: Map<string, { duration: number }>;
};

/**
 * Scrub a named sequence. If the loaded GLB ships a baked AnimationClip with
 * this name, scrub it via AnimationMixer.setTime; otherwise fall back to the
 * code-driven sequence. When the 3D chat delivers clips, zero scene-component
 * changes are needed.
 */
export function playSequence(
  name: SequenceName,
  nodes: Nodes,
  t: number,
  rig?: ClipRig | null,
): void {
  const clip = rig?.clips.get(name);
  if (clip && rig) {
    rig.mixer.setTime(clamp01(t) * clip.duration);
    return;
  }
  CODE_SEQUENCES[name](nodes, clamp01(t));
}

export type { Group };
