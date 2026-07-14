/** The rendering rig — build spec §3.5, framework-free. Procedural studio IBL
 * (RoomEnvironment → PMREM, no network HDRI), warm key with soft shadows,
 * cool fill, ACES + sRGB, a shadow-catcher plane so the product never floats. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { qp } from "./poses";

export type Rig = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  key: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  /** the fur/back light — rakes through the strands so their edges glow */
  rim: THREE.DirectionalLight;
};

export function buildRig(
  host: HTMLElement,
  getSize: () => { w: number; h: number },
): Rig {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  const { w, h } = getSize();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0; // was 1.05 — the brighter ambient compensates
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // IBL — procedural studio room (§3.5.1). AMBIENT-DOMINANT: fur is thousands
  // of alpha cards facing every direction; under a dominant single light half
  // blow out white and half crush to black — that is the "static" look. A
  // strong even world is what makes it read as plush (doc 13 Fix 1).
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.15; // was 0.55 — now the primary light

  // Longer lens (~28mm) reads as product photography, not a snapshot: bigger
  // subject, flatter/more expensive perspective, less distortion (doc 13 Fix 4).
  const camera = new THREE.PerspectiveCamera(qp("fov", 28), w / h, 0.01, 20);
  camera.position.set(0.26, 0.3, -0.78);

  // Warm key — now a shaper, not a hammer (doc 13 Fix 1).
  const key = new THREE.DirectionalLight(0xfff4e8, 1.25); // was 2.0
  key.position.set(-2.5, 3.5, -2.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 3; // was 6 — tighter, less mush
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.02;
  const c = key.shadow.camera as THREE.OrthographicCamera;
  c.left = -0.55; // tightened so the depth map isn't wasted on empty space
  c.right = 0.55;
  c.top = 0.55;
  c.bottom = -0.55;
  c.near = 1.0;
  c.far = 7;
  c.updateProjectionMatrix();
  scene.add(key);
  scene.add(key.target);

  // Cool-neutral fill from camera-right, no shadow (§3.5.1)
  const fill = new THREE.DirectionalLight(0xeef0f3, 0.45); // was 0.35
  fill.position.set(2.2, 0.9, -1.6);
  scene.add(fill);

  // THE FUR LIGHT (doc 13 Fix 1) — behind + above, aimed back toward camera.
  // Rakes THROUGH the strands so their edges glow: the whole visual signature
  // of "soft". This is what was missing. +Z is the far side, behind the basket.
  const rim = new THREE.DirectionalLight(0xffffff, 1.6);
  rim.position.set(0.6, 2.2, 2.8);
  scene.add(rim);

  // Shadow catcher — brought up so the shadow reads as CONTACT, not a cloud on
  // a distant floor (doc 13 Fix 2).
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.ShadowMaterial({ opacity: 0.26, color: 0x3a2f26 }), // was 0.32
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.18; // was -0.36
  catcher.receiveShadow = true;
  scene.add(catcher);

  return { renderer, scene, camera, key, fill, rim };
}
