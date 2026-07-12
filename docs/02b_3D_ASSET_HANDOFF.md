# 3D ASSET HANDOFF — FOR THE CLAUDE CODE (FABLE 5) BUILD CHAT
### v2.0 FINAL · 2026-07-09 · pair with 02_3D_MODEL_SPEC_v2.0_FINAL.md

## Files
- `deskpaws_desktop_FINAL.glb` — 362,981 tris · 7.01 MB · 6 draw calls
- `deskpaws_mobile_FINAL.glb` — 74,600 tris · 4.57 MB · 5 draw calls
- (`*_FINAL_BLENDER_PREVIEW.glb` are DCC-inspection twins — never ship)

## Tier selection (run before any asset fetch; fetch exactly ONE file)
1. `detect-gpu` (pmndrs) → `{ tier, isMobile }`.
2. `isMobile || tier < 2 || (navigator.deviceMemory ?? 8) <= 4` → **mobile**; else **desktop**. Detection failure → mobile.
3. Preload the chosen file (`<link rel="preload" as="fetch" crossorigin>`); no WebGL → poster-frame fallback, no GLB fetch.
4. Never hot-swap tiers mid-session (breaks scroll-scrub state). Optionally log fps<24 for analytics.

## Loader
- `GLTFLoader` + **`MeshoptDecoder`** (`loader.setMeshoptDecoder(MeshoptDecoder)`) — both tiers meshopt-compressed. **Draco is not used; do not wire DRACOLoader.**
- Textures are WebP via `EXT_texture_webp` (native in three.js).
- Desktop fur (`Plane` mesh, material `Furr Texture`) arrives alphaMode MASK → three.js gives `alphaTest≈0.15`, `transparent:false`. Keep it; do not set `transparent:true`. `side` is DoubleSide by design.

## Scene graph contract (identical names both tiers)
| Node | In desktop | In mobile | Role |
|---|---|---|---|
| `product_root` | ✓ | ✓ | idle rotation / global transforms |
| `Basket Top` | ✓ | ✓ | plush surface (mobile carries the 4K fur texture) |
| `Basket Bottom` | ✓ | ✓ | mesh weave bowl |
| `Base Structure.001` | ✓ | ✓ | clamp + frame (merged — fold/explode blocked until split) |
| `Screw.001` | ✓ | ✓ | screw + knob (single material) |
| `Plane` | ✓ | — | fur ribbons; code must not assume it exists (guard: `scene.getObjectByName('Plane')?`) |
| `Desk` (under `desk_proxy`) | ✓ | ✓ | worn-walnut slab; Scene-04 multi-surface swap NOT yet possible (single material only) |
| `annotation_01..04` | ✓ | ✓ | exploded-view callout anchors (empties) |

## Placement guarantees
Meters · basket Ø 0.40 m · +Y up · clamp faces +Z · world origin = dock point · desk top face on the origin plane. Camera/scroll choreography may hard-code against these.

## Not in these files yet (site must stub, not assume)
- **No animation clips.** All six (`dock`, `explode`, `knob_turn`, `fold`, `idle`, `fur_settle`) are pending; drive placeholder transforms in code (e.g., idle yaw on `product_root`) until clips land.
- **No desk material variants** — Scene 04's walnut→oak→marble→metal ritual needs the desk material sets, still unauthored.

## Performance watchpoints
- Desktop Scene-05 fur push-in is the overdraw worst case (122k masked double-sided tris full-frame). If frames drop there, first lever: cap `devicePixelRatio` at 1.5 for that scene — do not swap assets.
- Mobile targets 30fps; desktop 60fps (per creative direction).
