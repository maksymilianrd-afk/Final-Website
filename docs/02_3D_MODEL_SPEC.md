# DESKPAWS — 3D MODEL & SCENE SPECIFICATION
### v2.0 FINAL · 2026-07-09 · describes the shipped assets (supersedes v1.0–v1.2)

**Context:** the model is the persistent WebGL actor of a scroll-driven site (React Three Fiber + GSAP ScrollTrigger), on screen ~70% of the page. Two owner-approved delivery tiers exist. This document describes what **is**, not what was planned — the build must target this.

---

## 1. DELIVERABLES (final)

| | `deskpaws_desktop_FINAL.glb` | `deskpaws_mobile_FINAL.glb` |
|---|---|---|
| Triangles | 362,981 (owner-approved rich tier) | 74,600 (≤75k budget met) |
| File size | 7.01 MB | 4.57 MB |
| Draw calls | 6 | 5 |
| Fur strategy | 122,682-tri textured ribbon geometry (`Plane`), alphaMode **MASK** cutoff 0.15 | no fur geometry; fur baked into 4K `fur_gray` texture set on `Basket Top` (baseColor 4K, normal/roughness 2K) |
| Compression | meshopt (`EXT_meshopt_compression`) + WebP textures, both tiers | same |
| Source of truth | owner file `Final_Product_Comuters.glb` | owner file `Final_Mobile_3D2.glb` |

`*_FINAL_BLENDER_PREVIEW.glb` twins exist for DCC inspection only (no meshopt — Blender cannot decode meshopt). Never ship previews.

## 2. SCENE GRAPH (identical names across tiers; mobile = desktop minus `Plane`)

```
product_root                  (empty; idle-rotation / animation target)
├── Basket Top                (plush surface)
├── Basket Bottom             (mesh weave bowl)
├── Base Structure.001        (clamp + inner frame, MERGED — see §5.1)
├── Screw.001                 (screw + washer + star knob, single material)
└── Plane                     (fur ribbons — DESKTOP TIER ONLY)
desk_proxy                    (empty, sibling)
└── Desk                      (worn-walnut slab, owner's desk choice)
annotation_01..04             (hidden empties under product_root: fur rim, frame, bracket face, knob)
```

Owner rule (binding): **meshes remain separate objects — no joining.** Spec-name remapping (`basket_plush` etc.) from v1.0 is retired; code addresses the names above.

## 3. PLACEMENT GUARANTEES (normalized in both tiers)
Real-world meters; basket outer Ø = 0.40 m. +Y up, clamp faces +Z (glTF). World origin at the **dock point** (top-plate underside ↔ desk surface plane). Desk top face sits at the origin plane. All docking/scroll math may rely on this.

## 4. MATERIALS (as shipped — owner's values)
- `tripo_mat_c54c09d5.00x` on Basket Top — desktop: cream tripo baked set · mobile: `fur_gray` 4K grey fur set (baseColor + normal + roughness), metal 0, rough 1.0.
- `Furr Texture` on Plane (desktop only) — fur strand card texture, metal 0, **alphaMode MASK 0.15, doubleSided** (BLEND is forbidden: WebGL sorting artifacts).
- `Black Metal.00x` on Base Structure.001 — metal 0.54, rough 0.5.
- `Gray Metal Screw Texture.00x` on Screw.001 — metal 0.54, rough 0.5 (single material; the v1 knob polymer split was owner-reverted).
- `Basket Bottom Texture.00x` — perforated mesh weave set (fine variant).
- `Wood (desk texture)` — worn walnut diff+normal (displacement map removed; glTF cannot use it).
- v1.0's `#C9C9C7` grey / metalness-zero-fabric prescriptions are superseded where they conflict with the above.

## 5. PROCESSING RULES (for any future re-export)
1. **Hard-surface simplification:** meshopt simplifier with `lockBorder: true`, error ≤ 0.035, **no error escalation**. (Escalating error on the non-manifold clamp shells caused the v1.1 tearing.) Organic surfaces (basket, weave) may escalate.
2. **Mobile fur reduction** (if ribbons ever return to mobile): strand-count thinning by whole islands, never mesh-collapse.
3. Both tiers derive from owner masters through one pipeline run; never hand-edit one tier alone.

### 5.1 KNOWN LIMITATION (carried, owner-accepted for now)
`Base Structure.001` merges clamp and inner frame. The `fold` and `explode` clips (§6) **cannot be authored until it is split** into two objects (split can keep owner naming, e.g. `Base Structure.001` + `Frame.001`; islands separate cleanly — pipeline supports it on request).

## 6. STILL PENDING (unchanged obligations)
- Six animation clips: `dock` 120f · `explode` 100f · `knob_turn` 45f · `fold` 60f · `idle` 270f loop · `fur_settle` 20f — baked as named clips, linear-friendly, scrub-safe. Blocked in part by §5.1.
- Real desk PBR material sets (`M_desk_walnut/oak/marble/metal`, shared UVs on Desk) for the Scene-04 surface swap — current worn walnut is a single fixed look.
- Optional: KTX2/Basis texture pass if further size wins are needed.

## 7. VALIDATION (performed on the shipped files)
Loads via three.js `GLTFLoader` + `MeshoptDecoder` · node names verified identical across tiers (minus `Plane`) · annotations present · mobile clamp verified hole-free at macro distance · totals/draws as tabled in §1.
