# DESKPAWS WEBSITE — HANDOFF PACKAGE
### v2.0 · 2026-07-09 · Routing + live status board
The package now describes **shipped reality**, not plans. Claude Code builds against these documents as-is.

## The documents & routing
| File | Send to | Status |
|---|---|---|
| `01_CREATIVE_DIRECTION.md` v2.0 | Everyone | ✅ current — Scene 04 annotations remapped to shipped objects; surface ritual web-owned; fold coda text-only at launch |
| `02_3D_MODEL_SPEC.md` **v2.0 FINAL** | reference (authored by the 3D chat) | ✅ describes the delivered GLBs — the ground truth |
| `02b_3D_ASSET_HANDOFF.md` | **Claude Code** | ✅ loader/tier contract from the 3D chat |
| `03_HIGGSFIELD_ASSET_BRIEF.md` v2.0 | Higgsfield chat | 🟡 one asset open (HF-V06a) — status board inside |
| `04_COPY_DECK.md` v2.0 | Claude Code (+ Higgsfield for context) | ✅ current — verbatim source for all site copy |
| `05_WEBSITE_BUILD_SPEC.md` **v2.0** | **Claude Code (Fable 5)** | ✅ full rewrite against shipped assets — the build's primary contract |

**Claude Code session setup:** put `01`, `02`, `02b`, `04`, `05` in a `/docs` folder in the repo plus both GLBs in `/public/models/`. Tell it: *"Read /docs in numeric order. 05 is your contract; 02/02b win any conflict about assets. Build Phase 1 only, then stop for review."*

## What changed in v2.0 (the 3D pivot, summarized)
- **Two-tier GLB system** (desktop 363k tris / mobile 75k), meshopt + WebP, **Draco retired**. One file fetched per session via the detect-gpu logic in 02b.
- **Owner node names are the binding contract** (`Basket Top`, `Basket Bottom`, `Base Structure.001`, `Screw.001`, `Plane` desktop-only, `Desk`).
- **No baked animation clips yet** → all motion is code-driven sequences in the build (Build Spec §4), with a clip-adapter so baked clips can replace them later invisibly.
- **Clamp + frame are one merged object** → 3D fold animation blocked (coda ships as copy only); exploded view redesigned around the four real objects — and honestly reads better ("one piece" = the stability story).
- **Desk surface ritual moved from 3D pipeline to the web build** (runtime PBR texture swap with a Phase-3 quality gate and a graceful walnut-only fallback).

## Open items (the complete list — nothing else is pending)
1. 🔴 **HF-V06a "Elevation"** — the last Higgsfield asset (choreography spec in 03 §3.0).
2. 🟠 **Split `Base Structure.001`** into clamp + frame (3D chat; pipeline supports it) → unblocks `fold` + frame-separated explode, both slotted behind flags in the build.
3. 🟠 **Six baked animation clips** (3D chat, after the split) — optional quality upgrade; the site launches on code-driven motion.
4. 🟡 **Static Cut stills** — 4 keyframe renders each for Scenes 03/04/09 from the 3D chat (reduced-motion/no-WebGL fallback); grey placeholders until then.
5. 🟡 **Desk PBR texture sets** — sourced by the build itself (CC0), decided at the Phase-3 quality gate.
6. 🟡 **Plush color QC** — desktop `Basket Top` carries a cream-toned baked set under grey fur ribbons, mobile carries the grey `fur_gray` bake. Verify on-screen that both tiers read as the same grey product; if cream bleeds through on desktop, the 3D chat retints the base texture. Check this in Phase-2 review.
7. ⚪ Real customer reviews to replace the placeholder cards; wash-temperature verification from the supplier; the "vertical installation" claim (test on the sample before adding to copy); PP Neue Montreal license (fallback named in 05).

## The three sentences that keep everyone aligned
1. The product is the main character: it stays on screen and travels through the story — sections change around it.
2. Every animation must explain the product, advance the story, or prove quality — otherwise it gets cut.
3. Geometry explains, film seduces: 3D for mechanics and trust, Higgsfield footage for fur, cats, and the evening exhale — joined by match cuts.
