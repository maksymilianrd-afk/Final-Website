# DESKPAWS 3D — FINAL VALIDATION REPORT
### v2.0 FINAL assets · run 2026-07-11 · all checks programmatic

## Files under test
`deskpaws_desktop_FINAL.glb` · `deskpaws_mobile_FINAL.glb` · both `*_FINAL_BLENDER_PREVIEW.glb` twins

## Results

| Check | Desktop FINAL | Mobile FINAL |
|---|---|---|
| Khronos glTF validator | **0 errors** (2 warnings¹) | **0 errors** (3 warnings¹) |
| Loads via GLTFLoader + MeshoptDecoder path | ✅ decoded, bounds computed | ✅ |
| Triangles | 362,981 (owner tier) | **74,600 ≤ 75,000** ✅ |
| Draw calls | 6 ≤ 8 ✅ | 5 ≤ 8 ✅ |
| File size | 7.01 MB | 4.57 MB |
| Textures | 3.48 MB, 100% WebP ✅ | 3.93 MB, 100% WebP ✅ |
| Basket outer Ø | 0.3999 m ✅ | 0.3999 m ✅ |
| Clamp faces +Z | ✅ | ✅ |
| Dock origin (plate top at +6.0 mm) | ✅ | ✅ |
| Desk top vs origin plane | −0.9 mm (flush, within tolerance) | −0.9 mm |
| product_root + annotation_01..04 | ✅ present | ✅ present |
| Alpha modes | fur `Plane` = **MASK**, all else OPAQUE ✅ | all OPAQUE ✅ (no fur geometry by design) |
| Extensions | EXT_meshopt_compression, EXT_texture_webp, KHR_mesh_quantization | same |
| **Node parity** (desktop minus `Plane` ≡ mobile) | **TRUE** ✅ | |

**Blender smoke test (preview twins):** both import cleanly — desktop 12 objects, mobile 11 (identical minus `Plane`), every embedded image loads. Previews carry no meshopt (Blender-compatible), FINALs do (web delivery).

¹ The only warnings are `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE`: normal-mapped primitives ship without explicit tangents, so the renderer generates them at load. This is standard for Blender exports, harmless in three.js, and costs a few ms at load time. Fix (optional, cosmetic): a tangent-generation pass can be added to the pipeline if the build team prefers silence.

## Known open items (unchanged, tracked in spec v2.0 §5.1/§6)
No animation clips yet (six pending; `fold`/`explode` blocked on the `Base Structure.001` clamp/frame split) · desk material variant sets unauthored (Scene 04 swap not yet possible) · optional KTX2 pass available if smaller textures are ever needed.

**Verdict: both tiers ship-ready for the Claude Code build.**
