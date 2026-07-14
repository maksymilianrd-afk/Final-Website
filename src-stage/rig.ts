/** The rendering rig — build spec §3.5, framework-free. Procedural studio IBL
 * (RoomEnvironment → PMREM, no network HDRI), warm key with soft shadows,
 * cool fill, ACES + sRGB, a shadow-catcher plane so the product never floats. */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Rig = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  key: THREE.DirectionalLight;
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
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // IBL — procedural studio room (§3.5.1)
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 20);
  camera.position.set(0.32, 0.4, -1.02);

  // Warm key, upper-left, soft shadows (§3.5.1)
  const key = new THREE.DirectionalLight(0xfff4e8, 2.0);
  key.position.set(-2.5, 3.5, -2.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.01;
  const c = key.shadow.camera as THREE.OrthographicCamera;
  c.left = -0.8;
  c.right = 0.8;
  c.top = 0.8;
  c.bottom = -0.8;
  c.near = 0.5;
  c.far = 8;
  scene.add(key);
  scene.add(key.target);

  // Cool-neutral fill from camera-right, no shadow, no rim (§3.5.1)
  const fill = new THREE.DirectionalLight(0xeef0f3, 0.35);
  fill.position.set(2.2, 0.9, -1.6);
  scene.add(fill);

  // Shadow catcher — the broad soft pool under the product (§3.5.2)
  const catcher = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.ShadowMaterial({ opacity: 0.32, color: 0x3a2f26 }),
  );
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = -0.36;
  catcher.receiveShadow = true;
  scene.add(catcher);

  return { renderer, scene, camera, key, fill };
}
