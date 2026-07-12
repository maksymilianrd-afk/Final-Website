# DESKPAWS — HIGGSFIELD AI ASSET BRIEF
### Send this document to the Higgsfield generation chat · v1.0
**Purpose:** generate every photographic and film asset the cinematic website needs. Scene numbers refer to `01_CREATIVE_DIRECTION.md`. All 3D-rendered assets (scroll scrubs, exploded views, mobile fallback sequences) come from the GLB pipeline, NOT from Higgsfield — this brief covers only real-look photo/video.

---

## 1. ESTABLISHED WORKFLOW (carry over — this is proven)

- **Image model:** `nano_banana_pro`, multi-reference workflow. Cost: 2 credits/2K, 4 credits/4K.
- **Confirmed reference media IDs (use as image references on every product shot):**
  - `65c5d37f` — 3/4 hero view (primary identity reference)
  - `f9b97a1f` — side profile
  - `63f9e521` — clamp macro
  - `82549c77` — top-view sketch
  - `4c765bc3` — assembled front view
  - Additional confirmed: `db855bf8`, `6c6c8fab`
- **Prompting rule that outperforms:** describe the clamp as a **mechanical system with step-by-step physical constraints**, not visually. Template paragraph to embed in every prompt that shows the clamp:

> "The basket attaches to the desk with a matte black steel clamp bracket fixed at the exact center of the basket's edge. The clamp's flat top plate rests flush on the desk surface. Its vertical body hugs the desk edge downward. A lower plate sits beneath the desk. A silver threaded screw with a domed washer foot rises from a black star-shaped knob and tightens upward against the desk's underside. The basket cantilevers out beyond the desk edge; nothing but the clamp touches the desk."

- **Persistent geometry errors → generate fresh** rather than stacking edit passes.
- **Check the existing library before generating — several assets are partially done** (see the project files):
  - A **fur macro still** (generated 4 Jul, plush rim close-up with clamp edge) — strong candidate for the HF-V05 start frame; verify light comes from upper-left before using.
  - **Evening lifestyle stills** (walnut desk + black lamp on charcoal wall; dark-blue wall + banker's lamp) — these ARE the grade reference for HF-V07; one may serve directly as its start frame.
  - **Daylight lifestyle stills** (bright airy room; warm bookshelf scene) — HF-P01 may be selectable from the existing studio set rather than regenerated.
  - A **bare black frame-ring photo** (semi-circular tube + clamp, no fabric) — not a website asset, but forward it to the 3D chat as the inner_frame reference.
- **Aesthetic:** premium minimalist; warm beige (`#EDE7DE` family), walnut wood, matte black; soft studio or warm evening light; film-photography feel, shallow but honest depth of field. Never clinical white, never neon, never cluttered.

## 2. CONSTRAINT UPDATE (important)

The photo-library rule "no people, hands, faces, or animals" **still applies to all product/studio shots**. However, the website's trust and lifestyle scenes require real cat footage, so this brief introduces a controlled exception:

- **Cats ARE allowed** only in assets `HF-V06a/b/c`, `HF-V07`, and `HF-P08` (marked 🐈 below). Cat spec: a calm grey/silver shorthair (matches the plush palette) or soft tabby; healthy, relaxed body language only; never anthropomorphized, never costumed.
- **People, hands and faces remain banned in every asset.** Human presence is implied by props only (laptop, cup, notebook, lamp).

## 3. SHOT LIST

### 3.0 STATUS BOARD (v2.0 · 2026-07-09 — check before generating anything)
| Asset | Status | Winning generation → Topaz master |
|---|---|---|
| HF-P01 hero poster | ✅ LOCKED | `b1a80dd5` · 4:5 crop `5f94f9eb` |
| HF-V05 fur macro | ✅ LOCKED | take A `c8fb2672` → `9d2a47b4` |
| HF-V06a "Elevation" | 🔴 **OPEN — the only remaining asset** | required choreography: cat enters frame left → jumps onto the desk → walks rightward along it → sniffs the basket rim → steps in front-paws-first → settles with a tail wrap. Wide shot, the established oak-desk / panel-wall / office-chair scene, anchored on Max's real product photos (synthesized scenes keep failing the realism test — real-photo references are mandatory) |
| HF-V06b "Enclosure" | ✅ LOCKED | take 7 `94895b24` → `c55faf4d` |
| HF-V06c "Proximity" | ✅ LOCKED | `35d6670a` → `c4d54864` |
| HF-V07 evening film | ✅ LOCKED | take 2 `a36a4260` → `5fe83f47` |
| HF-P08 UGC card | ✅ LOCKED | `a5799bbe` |
| HF-P11 last-frame match photo | ✅ LOCKED | `bf71dd1a` |
| HF-P12 ad derivatives | ⏸ optional, after launch | — |

Standing rules that remain in force: include `declined_preset_id: '24bae836-2c4a-48e0-89b6-49fcc0b21612'` on every `generate_video` call; preflight costs with `get_cost: True`; scroll-scrub hero sequences are 3D-pipeline work, not Higgsfield.

### 3.1 ORIGINAL SHOT SPECIFICATIONS (kept for regeneration reference)

> Naming: `HF-V` = video, `HF-P` = photo. Generate photos at 4K (4 cr) for hero/match assets, 2K elsewhere. For video, prefer `kling3_0` (start-frame control + motion quality) with a nano_banana_pro-generated start frame; use `seedance_2_0` where identity fidelity across the clip matters most. Generate 2–3 takes per video asset and keep the best.

### HF-P01 — Hero fallback poster (Scene 01, also social OG image)
Photo, 4K, 4:5 and 16:9 crops. The exact hero composition: product clamped to a walnut desk-edge fragment floating in a beige studio void, 3/4 angle per ref `65c5d37f`, soft top-left key light, gentle floor shadow. This is the poster image shown before WebGL loads — it must match the 3D scene's framing as closely as possible (lighting direction: key from upper left, ~35°).

### HF-V05 — The Fur Macro (Scene 05 match cut) ★ highest priority
Video, 8–10s seamless-loopable, 16:9, 1080p minimum (upscale to 4K via `upscale_video` topaz 2160p). Extreme macro of the light-grey plush fur filling 100% of frame. A barely-perceptible air current moves individual fibers; warm raking light slides slowly across, golden-hour temperature. No product silhouette visible — pure material. Camera: locked or a 2% slow push. **Start frame:** generate first as a nano_banana_pro macro image referencing `63f9e521`/`f9b97a1f` fur regions, then image-to-video. The site crossfades from a 3D fur close-up into this — flat, even framing with light from the upper left so the cut matches.

### HF-V06a 🐈 — "Elevation" (Scene 06)
Video, 5–6s, 4:3, warm daytime home office. A grey cat steps up from a chair into the DeskPaws basket clamped at a walnut desk edge, settles front paws first. Side angle, desk edge crossing frame at lower third. Product geometry paragraph (§1) must be in the prompt; clamp visible and correct.

### HF-V06b 🐈 — "Enclosure" (Scene 06)
Video, 5–6s, 4:3. Overhead-ish 45° angle looking into the basket: the cat performs the classic circle-then-curl, melting into the plush. Fur-on-fur, extremely cozy. Basket rim frames the shot.

### HF-V06c 🐈 — "Proximity" (Scene 06)
Video, 5–6s, 4:3. The cat asleep in the basket at the desk edge, one paw draped over the rim toward the desk where a closed notebook and pen sit. Shallow focus on the paw. Quiet afternoon light.

### HF-V07 🐈 — The Evening Film (Scene 07 mirror) ★ second priority
Video, 10–12s, 16:9, 1080p+ (upscale). One slow continuous shot, no cuts: the established dark evening scene from the photo library — deep charcoal wall, walnut desk, warm brass/black lamp pooling light. DeskPaws clamped at the edge, cat asleep inside, an open laptop showing a finished document, a cup with faint steam. Camera drifts laterally ~10% with a very slight push toward the cat. Mood: end-of-day exhale. No humans. Match the grade of the existing dark lifestyle shots (refs: the black-lamp and banker-lamp images in the library).

### HF-P08 🐈 — UGC review card (Scene 08)
Photo, 2K, 4:5. Deliberately more casual than the library: a believable customer phone-photo of a cat in the basket at a slightly messy real desk (monitor edge, cables, sticky note) — natural window light, imperfect framing, but the product geometry still correct. It should look 20% less produced than everything else on the site; that contrast is what makes it read as real.

### HF-P11 — The Last Frame match photo (Scene 11) ★ third priority
Photo, 4K, same composition discipline as HF-P01 but this is the *closing* shot the 3D render dissolves into: identical camera position/lens feel to the site's final 3D pose (3/4 hero, product docked on walnut fragment, beige void). Generate 3–4 candidates; the build team will pick the one that match-cuts cleanest.

### HF-P12 — Social/ad derivative set (optional, after the site assets)
From the winning HF-P01/HF-P11/HF-V07 stills: 1:1 and 9:16 crops for Meta ads per the market report's visual strategy (hero = product+context; emotional = cat+window light).

## 4. TECHNICAL DELIVERY SPEC

| | Requirement |
|---|---|
| Video codec | H.264 MP4 + WebM VP9, muted, no audio track needed |
| Loops | HF-V05 must loop seamlessly (generate with matching first/last frame or plan a crossfade tail) |
| Color | Consistent warm grade across all assets; match the existing library's beige/walnut temperature |
| Posters | Export frame 0 of every video as a JPG poster |
| Naming | Deliver files named exactly as the asset IDs above (`HF-V05.mp4`, `HF-V05.webm`, `HF-V05_poster.jpg` …) |

## 5. ACCEPTANCE CHECKLIST (per asset, before marking done)
- [ ] Clamp anatomy correct: top plate ON desk, body hugging edge, screw+star knob BELOW, basket cantilevered — reject any render where the clamp floats, duplicates, or grips the wrong way
- [ ] Basket is round with plush rim + visible mesh underside; grey, not white or beige
- [ ] No humans/hands/faces anywhere; cats only in 🐈 assets
- [ ] Light direction upper-left on match-cut assets (HF-P01, HF-V05, HF-P11)
- [ ] Grade matches library; no oversaturation, no HDR halos
- [ ] Video: no morphing/warping of the clamp during motion (the #1 AI-video failure — regenerate, don't accept)

**Estimated credit budget:** ~12–16 cr photos + video generation/upscales per Higgsfield's current video pricing; preflight big video jobs with `get_cost` before submitting.
