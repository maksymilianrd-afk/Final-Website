/** The stage runner: loads one GLB tier, applies the fur decision tree and
 * desk anchoring, then runs a damped render loop reading the shared scroll
 * state (build spec §3 / §3.5). Framework-free; reuses the pure poses /
 * sequences / nodes modules. */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { NODE } from "./nodes";
import {
  ASSEMBLY_YAW,
  DESK_SHIFT,
  HERO,
  HERO_CONTAINED,
  computePose,
  qp,
} from "./poses";
import { buildRig, type Rig } from "./rig";
import { makeNodes, playSequence, type Nodes } from "./sequences";
import { state } from "./state";
import { modelUrl, type Tier } from "./tier";

const DAMP = 5;

export type StageMode = "film" | "contained";

export type StageConfig = {
  modelBase: string;
  furLevel: "a" | "b" | "c";
  mode: StageMode;
  /** reduced-motion: render, but no idle breathing / no scrub */
  reduced: boolean;
};

/** §3.5.6b — assign the mobile 4K fur_gray bake to desktop Basket Top. */
function applyFurBake(scene: THREE.Object3D, base: string): void {
  const top = scene.getObjectByName(NODE.top) as THREE.Mesh | undefined;
  if (!top) return;
  const mat = top.material as THREE.MeshStandardMaterial;
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const root = base.replace(/\/$/, "");
  const load = (file: string, cs: THREE.ColorSpace) => {
    const t = loader.load(root + "/" + file);
    t.colorSpace = cs;
    t.flipY = false;
    return t;
  };
  mat.map = load("fur_gray_basecolor.webp", THREE.SRGBColorSpace);
  mat.normalMap = load("fur_gray_normal.webp", THREE.NoColorSpace);
  mat.roughnessMap = load("fur_gray_roughness.webp", THREE.NoColorSpace);
  mat.color.set("#ffffff");
  mat.roughness = 1.0;
  mat.needsUpdate = true;
}

/** Material + shadow pass (doc 12 Fix 3 + doc 13 Fix 1/2). The model and maps
 * are good (see the Blender reference); the web renderer was throwing the
 * quality away. Three corrections: fur gets soft anti-aliased strand edges
 * (alphaToCoverage) and fabric sheen so it reads as plush not static; the hard
 * surfaces get correct binary metalness so the clamp stops being grey mud; the
 * desk finally casts a shadow. */
function prepare(scene: THREE.Object3D, renderer: THREE.WebGLRenderer): void {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;

    // Shadow flags. Fur self-shadowing would be noise + expensive; the desk
    // must both receive AND cast (the missing `castShadow`, doc 13 Fix 2).
    if (mesh.name === NODE.fur) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    } else if (mesh.name === NODE.desk) {
      mesh.receiveShadow = true;
      mesh.castShadow = true;
    } else {
      mesh.castShadow = true;
    }

    if (!mat) return;

    // colorSpace + grazing-angle sharpening on every map.
    if (mat.map && mat.map.colorSpace !== THREE.SRGBColorSpace) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
    }
    for (const t of [mat.map, mat.normalMap, mat.roughnessMap]) {
      if (t) t.anisotropy = maxAniso;
    }

    // Plush fabric (basket top + fur cards). The big fur wins — ambient rig,
    // rim light (rig.ts) and alphaToCoverage — all live on the standard
    // material, no risky physical conversion. alphaToCoverage routes the alpha
    // test through the multisample buffer → soft, anti-aliased strand edges.
    // (Fabric SHEEN, doc 13's optional "last 10%", is deferred: upgrading to
    // MeshPhysicalMaterial is what crashed the stage, so it stays out until it
    // can be verified in a browser.)
    if (mesh.name === NODE.top || mesh.name === NODE.fur) {
      mat.metalness = 0;
      mat.roughness = 1.0;
      mat.envMapIntensity = 1.3; // fur drinks ambient light — let it
      if (mesh.name === NODE.fur) {
        mat.alphaToCoverage = true; // soft strand edges — the single most important line
        mat.alphaTest = 0.28; // kills the faint fringe halo; A2C keeps it soft
        mat.transparent = false; // keep MASK — never BLEND (sorting artifacts)
        mat.side = THREE.DoubleSide;
      }
      mat.needsUpdate = true;
      return;
    }

    // Hard surfaces — metalness is effectively binary; 0.54 is grey mud.
    switch (mesh.name) {
      case NODE.screw: // zinc screw + washer = actual metal
        mat.metalness = 1.0;
        mat.roughness = 0.32;
        break;
      case NODE.base: // powder-coated steel = paint = dielectric
        mat.metalness = 0.12;
        mat.roughness = 0.55;
        mat.color.set("#17161a"); // near-black, not pure black — keeps form
        break;
      case NODE.bottom: // breathable mesh weave — non-metal
        mat.metalness = 0.0;
        mat.roughness = 0.9;
        break;
      case NODE.desk:
        mat.metalness = 0.0;
        mat.roughness = 0.45;
        break;
    }
    mat.envMapIntensity = 1.0;
    mat.needsUpdate = true;
  });
}

/** §3.5.4 — desk becomes a substantial anchored plane cropped by the frustum. */
function anchorDesk(scene: THREE.Object3D): void {
  const proxy = scene.getObjectByName(NODE.deskProxy);
  if (!proxy) return;
  const FRONT_EDGE_Z = 0.3557;
  const DEPTH = 1.8;
  proxy.scale.x = 3.2;
  proxy.scale.z = DEPTH;
  proxy.position.z = FRONT_EDGE_Z * (1 - DEPTH);
  proxy.position.x = DESK_SHIFT;
}

/** The nodes any mechanical sequence may move. Reset them all to rest each
 * frame before applying the ONE active sequence — so a node moved by the
 * explode can never stay stuck when the scene switches to the dock, and
 * vice-versa. Sequences compose from rest anyway; this just guarantees the
 * inverse for nodes the active sequence doesn't touch. */
const MECH = [
  NODE.root,
  NODE.top,
  NODE.bottom,
  NODE.base,
  NODE.screw,
  NODE.fur,
] as const;

function resetMechanical(nodes: Nodes): void {
  for (const name of MECH) {
    const n = nodes.get(name);
    const r = nodes.rest.get(name);
    if (n && r) {
      n.position.copy(r.position);
      n.quaternion.copy(r.quaternion);
      n.scale.copy(r.scale);
    }
  }
}

export async function initStage(
  host: HTMLElement,
  cfg: StageConfig,
  tier: Exclude<Tier, "none">,
  onReady: () => void,
): Promise<Rig> {
  const contained = cfg.mode === "contained";
  const getSize = () =>
    contained
      ? { w: host.clientWidth || window.innerWidth, h: host.clientHeight || 360 }
      : { w: window.innerWidth, h: window.innerHeight };
  const rig = buildRig(host, getSize);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const dpLoad = (window as unknown as { __dpLoad?: (p: number) => void })
    .__dpLoad;
  const gltf = await loader.loadAsync(
    modelUrl(cfg.modelBase, tier),
    (e: ProgressEvent) => {
      // real byte progress for the big GLB → the loader bar (0.45 → 0.95)
      if (e.total) dpLoad?.(0.45 + 0.5 * (e.loaded / e.total));
    },
  );
  const model = gltf.scene;

  prepare(model, rig.renderer);
  anchorDesk(model);
  if (tier === "desktop" && (cfg.furLevel === "b" || cfg.furLevel === "c")) {
    applyFurBake(model, cfg.modelBase);
  }
  if (cfg.furLevel === "c") {
    const fur = model.getObjectByName(NODE.fur);
    if (fur) fur.visible = false;
  }

  model.rotation.y = ASSEMBLY_YAW;
  rig.scene.add(model);

  const nodes: Nodes = makeNodes(model);
  const damped = {
    dockT: 1,
    tumble: 0,
    deskX: 0,
    idle: 1,
    magnet: 0,
    explodeT: 0,
    knobT: 0,
  };
  const targetVec = new THREE.Vector3(0.09, -0.02, 0.05);

  // ── Composition binding (Fix 6) ────────────────────────────────────────
  // The poses are world-space camera coords tuned at one aspect ratio; at any
  // other width the product drifts across the headline. Hold its horizontal
  // screen position INVARIANT across aspect ratios by panning the frustum
  // (setViewOffset). Zero at the reference aspect, so the tuned hero is
  // untouched; it only compensates the drift. Film mode only — contained mode
  // frames inside the hero box and has no such coupling.
  const REF_ASPECT = 16 / 9;
  const restCenter = new THREE.Vector3();
  const bboxCorners: THREE.Vector3[] = [];
  {
    const rootObj = nodes.get(NODE.root);
    if (rootObj) {
      const b = new THREE.Box3().setFromObject(rootObj);
      b.getCenter(restCenter);
      // the 8 corners, for projecting the product's screen bounds each frame
      for (const x of [b.min.x, b.max.x])
        for (const y of [b.min.y, b.max.y])
          for (const z of [b.min.z, b.max.z])
            bboxCorners.push(new THREE.Vector3(x, y, z));
    }
  }
  const probe = new THREE.PerspectiveCamera(qp("fov", 28), REF_ASPECT, 0.01, 20);
  const screenFracX = (aspect: number): number => {
    probe.aspect = aspect;
    probe.position.set(...HERO.camPos);
    probe.up.set(0, 1, 0);
    probe.lookAt(new THREE.Vector3(...HERO.camTarget));
    probe.updateMatrixWorld(true);
    probe.updateProjectionMatrix();
    return restCenter.clone().project(probe).x * 0.5 + 0.5;
  };
  const targetFracX = screenFracX(REF_ASPECT);
  const applyBinding = (): void => {
    if (contained) {
      rig.camera.clearViewOffset();
      return;
    }
    const { w, h } = getSize();
    const cur = screenFracX(w / h);
    const dx = (cur - targetFracX) * w;
    if (Number.isFinite(dx) && Math.abs(dx) > 0.5) {
      rig.camera.setViewOffset(w, h, dx, 0, w, h);
    } else {
      rig.camera.clearViewOffset();
    }
  };
  applyBinding();

  state.ready = true;
  onReady();

  // Contained mode holds a fixed centred pose; film mode reads the scroll table.
  let manualYaw = 0; // pointer-drag turntable offset
  if (contained) {
    rig.camera.position.set(...HERO_CONTAINED.camPos);
    targetVec.set(...HERO_CONTAINED.camTarget);
    rig.camera.lookAt(targetVec);
    // match the rig's Blender-style key + side sun so the phone hero fur reads
    // plush and sculpted, not flat.
    rig.key.intensity = 2.6;
    rig.fill.intensity = 1.6;

    // touch / drag to spin the whole still-life
    const canvas = rig.renderer.domElement;
    canvas.style.pointerEvents = "auto";
    canvas.style.touchAction = "pan-y";
    let dragging = false;
    let startX = 0;
    let startYaw = 0;
    const down = (x: number) => {
      dragging = true;
      startX = x;
      startYaw = manualYaw;
    };
    const move = (x: number) => {
      if (dragging) manualYaw = startYaw + (x - startX) * 0.008;
    };
    const up = () => {
      dragging = false;
    };
    canvas.addEventListener("pointerdown", (e) => down(e.clientX));
    window.addEventListener("pointermove", (e) => move(e.clientX));
    window.addEventListener("pointerup", up);
  }

  const clock = new THREE.Clock();
  let lastOpacity = "1";
  const annoVec = new THREE.Vector3();
  const cornerVec = new THREE.Vector3();
  const docEl = document.documentElement;
  const annoEl = document.querySelector<HTMLElement>(".ink-annotation");
  const connectorPath = document.getElementById("ink-connector-path");
  function frame() {
    const delta = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;

    if (contained) {
      // An unmistakable turntable: the whole still-life spins slowly and
      // continuously (a full turn in ~18s), plus any pointer-drag offset.
      // Reduced-motion instead gets a gentle bounded sway (never a full spin).
      const auto = cfg.reduced ? Math.sin(t * 0.4) * 0.12 : t * 0.35;
      model.rotation.y = ASSEMBLY_YAW + manualYaw + auto;
      rig.renderer.render(rig.scene, rig.camera);
      requestAnimationFrame(frame);
      return;
    }

    const pose = computePose(state.sceneId, state.progress);

    // camera + target damping (the weighted dolly)
    rig.camera.position.x = THREE.MathUtils.damp(rig.camera.position.x, pose.camPos[0], DAMP, delta);
    rig.camera.position.y = THREE.MathUtils.damp(rig.camera.position.y, pose.camPos[1], DAMP, delta);
    rig.camera.position.z = THREE.MathUtils.damp(rig.camera.position.z, pose.camPos[2], DAMP, delta);
    targetVec.x = THREE.MathUtils.damp(targetVec.x, pose.camTarget[0], DAMP, delta);
    targetVec.y = THREE.MathUtils.damp(targetVec.y, pose.camTarget[1], DAMP, delta);
    targetVec.z = THREE.MathUtils.damp(targetVec.z, pose.camTarget[2], DAMP, delta);
    rig.camera.lookAt(targetVec);

    // light intensity per scene — dim the ENVIRONMENT and rim too, not just the
    // directional lights, or night scenes stay bright (a glowing basket on a
    // black background). A 0.12 floor leaves a shape in the dark, not a void
    // (doc 13 Fix 5).
    const lit = Math.max(pose.light, 0.12);
    rig.key.intensity = THREE.MathUtils.damp(rig.key.intensity, 2.6 * pose.light, DAMP, delta);
    rig.fill.intensity = THREE.MathUtils.damp(rig.fill.intensity, 1.6 * Math.max(pose.light, 0.3), DAMP, delta);
    rig.scene.environmentIntensity = THREE.MathUtils.damp(rig.scene.environmentIntensity, 1.15 * lit, DAMP, delta);

    // sequence state
    damped.dockT = THREE.MathUtils.damp(damped.dockT, pose.dockT, DAMP, delta);
    damped.tumble = THREE.MathUtils.damp(damped.tumble, pose.tumble, DAMP, delta);
    damped.deskX = THREE.MathUtils.damp(damped.deskX, pose.deskX, DAMP, delta);
    damped.idle = THREE.MathUtils.damp(damped.idle, pose.idle, DAMP, delta);
    damped.magnet = THREE.MathUtils.damp(damped.magnet, pose.magnet * state.pointerX, DAMP, delta);
    damped.explodeT = THREE.MathUtils.damp(damped.explodeT, pose.explodeT, DAMP, delta);
    damped.knobT = THREE.MathUtils.damp(damped.knobT, pose.knobT, DAMP, delta);

    // Reset every mechanical node to rest, then apply exactly ONE sequence for
    // the current scene. This is what lets the product leave and re-enter the
    // film without a node getting stuck mid-explode when scenes switch (Fix 1).
    resetMechanical(nodes);
    if (state.sceneId === 4) {
      playSequence("explode", nodes, damped.explodeT);
    } else if (state.sceneId === 9) {
      playSequence("knob_turn", nodes, damped.knobT);
    } else {
      playSequence("dock", nodes, damped.dockT);
    }

    // rotation layers on the root: idle breathing + magnetism + tumble
    const root = nodes.get(NODE.root);
    const rest = nodes.rest.get(NODE.root);
    if (root && rest) {
      const idleYaw = ((1.5 * Math.PI) / 180) * Math.sin((t / 9) * Math.PI * 2) * damped.idle;
      const magnetYaw = ((4 * Math.PI) / 180) * damped.magnet;
      root.rotateY(idleYaw + magnetYaw);
      root.rotateX(damped.tumble);
    }

    // the desk fragment travels on its own axis (the carry slide-off)
    const deskProxy = nodes.get(NODE.deskProxy);
    const deskRest = nodes.rest.get(NODE.deskProxy);
    if (deskProxy && deskRest) {
      deskProxy.position.x = deskRest.position.x + damped.deskX;
    }

    // Fix 3 — project the GLB annotation locators (rim, frame, bracket, knob)
    // into screen space so DOM callouts follow the real parts at any camera
    // angle or width. anno4 = the star knob, the hero arrow's target. The pan
    // from the composition binding is baked into camera.project, so these land
    // exactly where the product is drawn.
    let knobInFront = false;
    let knobX = 0;
    let knobY = 0;
    for (let i = 1; i <= 4; i++) {
      const anchor = nodes.get(`annotation_0${i}`);
      if (!anchor) continue;
      anchor.getWorldPosition(annoVec);
      annoVec.project(rig.camera);
      const inFront = annoVec.z < 1;
      const sx = (annoVec.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-annoVec.y * 0.5 + 0.5) * window.innerHeight;
      docEl.style.setProperty(`--anno${i}-x`, `${sx}px`);
      docEl.style.setProperty(`--anno${i}-y`, `${sy}px`);
      docEl.style.setProperty(`--anno${i}-on`, inFront ? "1" : "0");
      if (i === 4) {
        knobInFront = inFront;
        knobX = sx;
        knobY = sy;
      }
    }
    // The hero note: shown only when the star-knob is a real, front-facing point
    // and the hero product is on screen (never over a placeholder or mid-scroll,
    // doc 14). Placed just BELOW the product's projected bounding box so it can
    // never land on the fur; a connector line is drawn up to the knob.
    const annoReady =
      state.sceneId === 1 &&
      pose.canvasOpacity > 0.9 &&
      knobInFront &&
      bboxCorners.length > 0;
    if (annoReady && connectorPath) {
      let maxY = -Infinity;
      for (const corner of bboxCorners) {
        cornerVec.copy(corner).project(rig.camera);
        const sy = (-cornerVec.y * 0.5 + 0.5) * window.innerHeight;
        if (sy > maxY) maxY = sy;
      }
      const noteY = Math.min(maxY + 30, window.innerHeight - 84);
      const noteX = Math.max(20, Math.min(knobX - 70, window.innerWidth - 190));
      docEl.style.setProperty("--note-x", `${noteX}px`);
      docEl.style.setProperty("--note-y", `${noteY}px`);
      const sX = noteX + 34;
      const sY = noteY - 6;
      const midY = (sY + knobY) / 2;
      connectorPath.setAttribute(
        "d",
        `M ${sX} ${sY} C ${sX} ${midY}, ${knobX} ${midY}, ${knobX} ${knobY} ` +
          `M ${knobX - 7} ${knobY + 12} L ${knobX} ${knobY} L ${knobX + 7} ${knobY + 12}`,
      );
    }
    document.body.classList.toggle("dp-anno-on", annoReady);

    // hand-off: the product features in 1–4/9/11 and fades to the DOM media in
    // the content scenes. Set the target only on change; the #dp-canvas CSS
    // opacity transition (0.4s) does the fade, so JS never fights it per frame.
    const targetOp = String(pose.canvasOpacity);
    if (targetOp !== lastOpacity) {
      host.style.opacity = targetOp;
      lastOpacity = targetOp;
    }

    rig.renderer.render(rig.scene, rig.camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Resize handling. On phones the address bar collapsing fires a height-only
  // resize mid-scroll; ignore those (Fix 5) so we don't thrash the renderer or
  // restart the projection. Re-run the composition binding on real resizes.
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  const onResize = (): void => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    if (nw === vw && Math.abs(nh - vh) < 120) return; // mobile toolbar, not real
    vw = nw;
    vh = nh;
    const { w, h } = getSize();
    rig.camera.aspect = w / h;
    applyBinding(); // calls updateProjectionMatrix (with or without the offset)
    rig.renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", () => setTimeout(onResize, 250));

  return rig;
}
