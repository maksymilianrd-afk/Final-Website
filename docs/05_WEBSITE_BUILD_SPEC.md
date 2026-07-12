# DESKPAWS — WEBSITE BUILD SPECIFICATION
### v2.0 · 2026-07-09 · For Claude Code (Fable 5) · supersedes v1.x entirely
**Companion documents (read all four before writing code):** `01_CREATIVE_DIRECTION.md` (what the film is), `04_COPY_DECK.md` (every word, verbatim), `02_3D_MODEL_SPEC.md` v2.0 FINAL + `02b_3D_ASSET_HANDOFF.md` (what the 3D assets actually are).
**Precedence rule:** 02/02b describe shipped reality — they win over anything here or in the creative direction that assumes different assets. Where 02 says a thing does not exist yet (clips, desk variants, frame split), this spec defines the stub. **Never block a phase waiting on a pending asset.**

---

## 0. WHAT CHANGED SINCE v1.x (delta summary — internalize before coding)
1. **Two GLB tiers**, not one: `deskpaws_desktop_FINAL.glb` (362,981 tris / 7.01 MB) and `deskpaws_mobile_FINAL.glb` (74,600 tris / 4.57 MB). Exactly one is fetched per session.
2. **Node names changed.** The v1 names (`basket_plush`, `inner_frame`, `clamp_bracket`, `clamp_screw`) are retired. The binding contract is: `product_root`, `Basket Top`, `Basket Bottom`, `Base Structure.001`, `Screw.001`, `Plane` (desktop only), `desk_proxy/Desk`, `annotation_01..04`.
3. **No baked animation clips exist.** All motion is **code-driven transforms** (§4). A clip-adapter seam (§4.5) lets baked clips replace code paths later without touching scene components.
4. **`Base Structure.001` merges clamp + inner frame** → the `fold` animation and a frame-separated explode are impossible. Explode uses the four real objects (§4.2). Fold coda ships text-only behind a flag (§4.6).
5. **Desk has one material** (worn walnut). The Scene-04 surface ritual is now **owned by the web build** as a runtime texture swap (§5). The 3D pipeline will not deliver material variants.
6. **Meshopt only. Draco is dead.** Wiring DRACOLoader is a build error.

## 1. STACK (fixed — do not re-litigate)
Next.js 15 App Router · React 19 · `three` + `@react-three/fiber` + `@react-three/drei` · `gsap` + `ScrollTrigger` + `lenis` · Tailwind v4 · Zustand (`useSceneStore`, `useCartStore`) · Shopify Storefront API (headless cart → `checkoutUrl` redirect; env `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_DOMAIN`). Fonts self-hosted via `next/font/local` (PP Neue Montreal; fallback = single display grotesk + Geist; never Inter, never a serif). One animation system: GSAP for scroll choreography, CSS for micro-UI only. Shell is RSC; all motion/3D lives in `"use client"` leaves.

## 2. ASSET TIERING & LOADING (implement exactly — from 02b)

```ts
// lib/gpuTier.ts — run once, before any GLB fetch
import { getGPUTier } from 'detect-gpu';
export async function pickTier(): Promise<'desktop'|'mobile'|'none'> {
  if (!hasWebGL()) return 'none';                       // poster-frame site, no GLB fetch
  try {
    const { tier, isMobile } = await getGPUTier();
    const lowMem = (navigator.deviceMemory ?? 8) <= 4;
    return (isMobile || tier < 2 || lowMem) ? 'mobile' : 'desktop';
  } catch { return 'mobile'; }                          // detection failure → mobile
}
```
- Preload the chosen file only: `<link rel="preload" as="fetch" crossorigin href="/models/deskpaws_{tier}_FINAL.glb">`, injected after first paint.
- **Never hot-swap tiers mid-session** (it would desync scroll-scrub state). Optionally report `fps<24` to analytics; do not react to it live.
- Loader wiring (the only correct configuration):
```ts
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);   // REQUIRED — both tiers are meshopt
// NO DRACOLoader. NO KTX2Loader needed — textures are WebP via EXT_texture_webp (native).
```
- **Fur material guard (desktop):** the `Plane` mesh ships alphaMode MASK → three.js sets `alphaTest≈0.15`, `transparent:false`, `side:DoubleSide`. Leave all three untouched. Setting `transparent:true` re-introduces the sorting artifacts the 3D pipeline just spent a week killing.
- **Existence guards everywhere:** `scene.getObjectByName('Plane')` may be undefined (mobile). Centralize node access:
```ts
// lib/nodes.ts — the ONLY place node names appear as strings
export const NODE = {
  root:'product_root', top:'Basket Top', bottom:'Basket Bottom',
  base:'Base Structure.001', screw:'Screw.001', fur:'Plane',
  desk:'Desk', anno:(i:1|2|3|4)=>`annotation_0${i}`,
} as const;
```
- Placement guarantees the code may hard-code against: meters · basket Ø 0.40 m · +Y up · clamp faces +Z · **world origin = dock point** · desk top face on the origin plane.

## 3. GLOBAL ARCHITECTURE — THE PERSISTENT ACTOR (unchanged concept, restated as contract)
One fixed full-viewport `<Canvas>` (z-10) holds the product for the whole page; DOM scenes scroll at z-20 (flip individual text blocks to z-0 when they must pass behind the product). ScrollTrigger writes `{sceneId, progress}` into `useSceneStore`; a single `useFrame` damps toward a **pose table** entry per scene: `{cameraPos, cameraTarget, rootYaw, tierVisibility, deskVisible, activeSequence, seqProgress}` with damping ~0.08 (the "weighted dolly"). Canvas is `pointer-events:none` except Scene 01 (hover magnetism ±4° yaw) and Scene 04 Movement B (part hover) — toggled via store. GrainOverlay: fixed, pointer-events-none, z-50, static 3% noise tile (never animated on mobile tier). Two master easings sitewide: camera `cubic-bezier(0.16,1,0.3,1)`, mechanical `cubic-bezier(0.65,0,0.35,1)`.

## 4. MOTION LIBRARY — CODE-DRIVEN SEQUENCES (replaces baked clips)
Implement `lib/sequences.ts`: pure functions `(nodes, t: 0..1) => void` mutating transforms. Scroll scrubs `t`; every sequence must be exactly reversible (idempotent at any `t`, no internal state). All rotations in radians; all offsets in meters relative to **rest pose captured once at load** (`captureRest(scene)` stores position/quaternion/scale per node — sequences always compose from rest, never from current).

### 4.1 `seqDock(t)` — Scene 03
- t 0→0.55: `product_root` translates from start offset `(+0.25 Z, −0.12 Y)` to origin along the camera-visible approach; ease mechanical.
- t 0.55→0.6: settle — 2mm overshoot down, spring back (single damped bounce).
- t 0.6→0.95: `Screw.001` rotates about its local screw axis 270° total **with three detents** (hold rotation flat for Δt=0.02 at 90°/180°/270°) while translating +Y 2.5mm per 90° (thread illusion).
- t 0.95→1: `furSettle()` impulse (§4.4) + 1px camera micro-shake (one frame).

### 4.2 `seqExplode(t)` — Scene 04 Movement B (four real objects; frame stays with clamp — accepted)
| Node | t=1 offset from rest |
|---|---|
| `Basket Top` | +0.14 m Y |
| `Basket Bottom` | +0.055 m Y (gap reveals the weave between top and bottom) |
| `Base Structure.001` | +0.06 m Z, tilt −12° X (presents the C-profile to camera) |
| `Screw.001` | −0.06 m Y, spin −720° (unthreads) |
Each part's motion is staggered inside t (Top 0–0.35, Bottom 0.15–0.5, Base 0.4–0.75, Screw 0.6–1) so scroll reads as a hand disassembling, not an explosion. Annotation hairlines draw from `annotation_01..04` anchors in the same stagger (SVG overlay projected via `toScreenPosition`; 1px ink; mono labels from the copy deck — **the four labels changed in v2.0, use the deck verbatim**).

### 4.3 `seqKnob(t)` — Scene 09 steps: re-uses the screw segment of `seqDock` (t 0.6–0.95 remapped to 0–1).
### 4.4 `furSettle()` — no morph target exists. Fake it: spring `Basket Top` (and `Plane` if present) `scale.y 1→0.97→1.005→1` over 350ms, transform-origin at rim height (offset pivot via parent group set at rest). Subtle; if it reads rubbery, halve amplitude.
### 4.5 Clip-adapter seam — `playSequence(name, t)` first checks `gltf.animations` for a baked clip of that name and scrubs it via `AnimationMixer.setTime` if found; otherwise falls back to the code sequence. When the 3D chat delivers clips, zero scene-component changes.
### 4.6 `seqFold` — **BLOCKED** (merged Base Structure). Ship `FEATURES.fold3D=false`: Scene 09's fold coda renders its copy line + mono label only, no 3D motion. Leave the sequence file stubbed with a TODO referencing 02 §5.1.
### 4.7 `idle` — sine yaw on `product_root`, ±1.5°, 9s period, runs whenever no sequence owns the root; cross-fades out over 400ms when a scene takes control.

## 5. DESK SURFACE RITUAL — NOW WEB-OWNED (Scene 04 Movement C)
The `Desk` mesh ships with one worn-walnut material and usable UVs. The build supplies its own PBR sets and swaps maps at runtime:
- Source four CC0 1K sets (ambientCG / Poly Haven), convert to WebP: `/public/textures/desk/{walnut,oak,marble,metal}/{diff,nrm,rough}.webp`. Walnut set should visually approximate the shipped material so beat 1 is seamless.
- Implement `swapDeskSurface(name)`: preload all sets during Scene 03; on each scroll beat crossfade via a 300ms `material.map` blend (simplest robust method: two overlapping Desk material states — clone mesh, fade opacity — rather than a custom shader; choose whichever survives review on the worn-walnut UV layout).
- **Quality gate:** if marble/metal look smeared on the desk UVs, cut to the fallback: keep walnut only, and the beat becomes the mono line `FITS EDGES 20–75 MM · WOOD, LAMINATE, MARBLE, METAL` + the struck-glass moment. The ritual is a delight, not a dependency — decide at Phase-3 review with side-by-side screenshots.

## 6. SCENE → SCROLLTRIGGER MAP (v2.0 — pinned lengths unchanged from creative direction)
| # | Component | Pin | Scrub spec |
|---|---|---|---|
| 00 | `IntroMark` | — | SVG line-draw 1.4s → FLIP morph to nav logo; skippable; once per session |
| 01 | `SceneHero` | no | poster `HF-P01` under canvas until GLB ready (§8); exit: text out, desk slides off, root tumble begins over first 100vh |
| 02 | `SceneProblem` | 2.5vh | char-split type-on; 5 paw-press squashes at t .3–.7; select-all+delete at .85–1; product dim at frame right (`tierVisibility` low-light pose) |
| 03 | `SceneTurn` | 2vh | `seqDock` scrubbed 0→1; bg luminance sweep; headline reveal at .8 |
| 04 | `SceneGrip` | 4vh | .0–.25 orbit-to-macro · .25–.75 `seqExplode` + 4 annotation draws · .75–1 reassemble + `swapDeskSurface` beats + edge counter + struck-glass |
| 05 | `SceneSoft` | 2.5vh | .0–.4 push into `Plane` fur (desktop) / `Basket Top` texture (mobile) · **DPR clamp 1.5 while sceneId===5 on desktop** (overdraw worst case per 02b — first lever, never asset swap) · .4–.45 match-cut crossfade to `HF-V05` (canvas opacity↔video opacity, camera frozen) · .9–1 reverse cut |
| 06 | `SceneCatLogic` | no | sticky left col; clips lazy-play at 60% viewport |
| 07 | `SceneMirror` | 3vh | `HF-V07` bg; 3 lines at .25/.55/.85; ghost-UI ✓ fades |
| 08 | `SceneReviews` | no | rAF drift 18px/s, hover-pause, drag inertia |
| 09 | `SceneHowTo` | 1.5vh | 3 steps scrub `seqKnob`/`seqDock` sub-ranges; clickable steps tween t; fold coda text-only (`FEATURES.fold3D` flag) |
| 10 | `SceneFaq` | no | native-semantics accordion, 350ms, nothing else |
| 11 | `SceneFinal` | no | 3D→`HF-P11` crossfade at 40% viewport; CTA; mini line-draw end card |

## 7. PERFORMANCE BUDGET (hard gates)
LCP ≤ 2.5s (poster+headline paint first; R3F chunk via `next/dynamic` ssr:false) · initial JS ≤ 320 KB gz · GLB preload after paint, one tier only · videos `preload="none"` → upgrade one scene ahead via IntersectionObserver, always `muted playsinline loop poster` · 60fps desktop / 30fps mobile in pinned scenes (drei `PerformanceMonitor` may drop DPR 2→1.5→1.25; Scene 05 pre-clamps 1.5) · CLS≈0 (explicit aspect boxes) · transforms/opacity only · `will-change` only while a scene is active.

## 8. FORKS (build these as first-class, not patches)
- **`tier==='none'` / `prefers-reduced-motion` / weak devices:** the Static Cut — no pinning, no canvas. Each scene renders its keyframe composition (hero `HF-P01`; Scenes 03/04/09 use pre-rendered stills — request a 4-frame render set per scene from the 3D chat via the README, use grey aspect-correct placeholders until then; Scene 02 shows the final corrupted headline as static text; videos become poster+tap-to-play). Fully readable, fully purchasable. This is also the SEO/no-JS skeleton.
- **Mobile tier specifics:** no `Plane` (guards everywhere), fur is the 4K `Basket Top` bake — Scene 05's push-in targets that surface; pettable displacement shader is desktop-only (timebox one session; plain video is the honorable fallback), grain static, Scene-04 part-hover off.
- **A11y:** copy in real DOM order; no focus traps in pinned sections; skip-link to `#product-cta`; Scene-04 annotations are a `<dl>`; reviews rail a `<ul>`; FAQ real disclosure semantics; reduced-motion honored in CSS too.

## 9. ASSET MANIFEST (build-time expectations)
```
/public/models/deskpaws_desktop_FINAL.glb   ✅ delivered (7.01 MB)
/public/models/deskpaws_mobile_FINAL.glb    ✅ delivered (4.57 MB)
/public/media/HF-P01 …HF-V05 …HF-V06a/b/c …HF-V07 …HF-P08 …HF-P11   (per Higgsfield brief status table; V06a pending — grey placeholder until delivered)
/public/textures/desk/{walnut,oak,marble,metal}/{diff,nrm,rough}.webp   (build sources these, §5)
/public/frames/scene0{3,4,9}_k{1..4}.webp   (Static Cut stills — pending from 3D chat; placeholders OK)
/public/fonts/…
```
Missing asset → labeled grey placeholder at correct aspect, keep building. Never hotlink, never block.

## 10. BUILD PHASES (each ends with a deployable state + a review gate)
1. **Skeleton & commerce** — all 11 scenes static (the Static Cut, real copy), Shopify cart/checkout, FAQ, reviews rail static, Lighthouse ≥95. *Launchable after Phase 1.*
2. **The Stage** — tier pick, loader, node registry, rest-pose capture, pose table, Lenis+ScrollTrigger, hero idle + scroll-carry, `seqDock`.
3. **The centerpiece** — `seqExplode` + annotations + desk-surface module (+ quality-gate review with screenshots), `seqKnob` for Scene 09.
4. **The film moments** — paw-typed headline, Scene-05 match cut (+DPR clamp; shader if it cooperates), Scene 07, Scene 11, intro mark.
5. **Polish & forks** — Static Cut completeness, mobile-tier pass on a real phone, analytics events (scene-reached 1–11, dock-completed, add-to-cart, begin-checkout, tier-served), easing audit, grain, microcopy.

## 11. DEFINITION OF DONE
- [ ] Node access only via `lib/nodes.ts`; zero raw name strings in components; `Plane` guarded everywhere
- [ ] MeshoptDecoder wired; no DRACOLoader anywhere in the bundle; fur material untouched (MASK, transparent:false, DoubleSide)
- [ ] One GLB fetched per session, tier logic verbatim from §2, no mid-session swap
- [ ] Every sequence scrubs cleanly both directions at any speed; clip-adapter seam in place
- [ ] Scene-05 DPR clamp active on desktop; 60/30fps gates measured in pinned scenes
- [ ] Fold coda text-only behind `FEATURES.fold3D=false`; desk-ritual quality gate decided and documented
- [ ] All copy verbatim from `04_COPY_DECK.md`; one CTA label sitewide; Static Cut fully purchasable
- [ ] Checkout completes end-to-end; performance gates (§7) pass throttled
- [ ] No banned patterns: no Inter/serif/icon-grids/purple/decorative parallax; max 3 mono eyebrows page-wide
