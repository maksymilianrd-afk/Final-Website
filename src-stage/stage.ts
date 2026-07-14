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
  HERO_CONTAINED,
  computePose,
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

function prepare(scene: THREE.Object3D): void {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    if (mesh.name === NODE.fur) {
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    } else if (mesh.name === NODE.desk) {
      mesh.receiveShadow = true;
    } else {
      mesh.castShadow = true;
    }
    // colorSpace verification (§3.5.1)
    if (mat && mat.map && mat.map.colorSpace !== THREE.SRGBColorSpace) {
      mat.map.colorSpace = THREE.SRGBColorSpace;
      mat.needsUpdate = true;
    }
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
  const gltf = await loader.loadAsync(modelUrl(cfg.modelBase, tier));
  const model = gltf.scene;

  prepare(model);
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
  const damped = { dockT: 1, tumble: 0, deskX: 0, idle: 1, magnet: 0 };
  const targetVec = new THREE.Vector3(0.09, -0.02, 0.05);

  state.ready = true;
  onReady();

  // Contained mode holds a fixed centred pose; film mode reads the scroll table.
  let manualYaw = 0; // pointer-drag turntable offset
  if (contained) {
    rig.camera.position.set(...HERO_CONTAINED.camPos);
    targetVec.set(...HERO_CONTAINED.camTarget);
    rig.camera.lookAt(targetVec);
    rig.key.intensity = 2.0;
    rig.fill.intensity = 0.35;

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

    // light intensity per scene
    rig.key.intensity = THREE.MathUtils.damp(rig.key.intensity, 2.0 * pose.light, DAMP, delta);
    rig.fill.intensity = THREE.MathUtils.damp(rig.fill.intensity, 0.35 * Math.max(pose.light, 0.3), DAMP, delta);

    // sequence state
    damped.dockT = THREE.MathUtils.damp(damped.dockT, pose.dockT, DAMP, delta);
    damped.tumble = THREE.MathUtils.damp(damped.tumble, pose.tumble, DAMP, delta);
    damped.deskX = THREE.MathUtils.damp(damped.deskX, pose.deskX, DAMP, delta);
    damped.idle = THREE.MathUtils.damp(damped.idle, pose.idle, DAMP, delta);
    damped.magnet = THREE.MathUtils.damp(damped.magnet, pose.magnet * state.pointerX, DAMP, delta);

    // the dock sequence composes root+screw from rest (scrub-safe)
    playSequence("dock", nodes, damped.dockT);

    // rotation layers: idle breathing + magnetism + tumble
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

    // hand-off: canvas opacity fades the stage out at Scene 04
    host.style.opacity = String(pose.canvasOpacity);

    rig.renderer.render(rig.scene, rig.camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener("resize", () => {
    const { w, h } = getSize();
    rig.camera.aspect = w / h;
    rig.camera.updateProjectionMatrix();
    rig.renderer.setSize(w, h);
  });

  return rig;
}
