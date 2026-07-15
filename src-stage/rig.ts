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
  /** strong sun, almost overhead, pointing down (the Blender key) */
  key: THREE.DirectionalLight;
  /** angled side sun raking across the basket */
  fill: THREE.DirectionalLight;
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
  renderer.toneMappingExposure = 1.08; // brighter, closer to the EEVEE reference
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

  // KEY — a strong sun almost directly overhead, pointing down (doc 14: the
  // Blender setup Max lit it with). Casts the contact shadow under the basket.
  const key = new THREE.DirectionalLight(0xfff6ee, 2.6); // was 1.25 — now the sun
  key.position.set(0.5, 6.0, -0.5); // high overhead, a touch toward camera-front
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 3;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.02;
  const c = key.shadow.camera as THREE.OrthographicCamera;
  c.left = -0.7; // widened for the bigger product
  c.right = 0.7;
  c.top = 0.7;
  c.bottom = -0.7;
  c.near = 1.0;
  c.far = 9; // the key now sits at y=6
  c.updateProjectionMatrix();
  scene.add(key);
  scene.add(key.target);

  // SIDE SUN — the second Blender sun, angled low from camera-left so its beams
  // rake ACROSS the side of the basket, catching the fur and defining form. No
  // shadow (avoids a competing second shadow).
  const fill = new THREE.DirectionalLight(0xfff2e6, 1.6); // was 0.45
  fill.position.set(-4.5, 2.0, -1.2);
  scene.add(fill);

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

  return { renderer, scene, camera, key, fill };
}
