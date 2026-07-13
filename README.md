# DeskPaws — Shopify theme

A cinematic, one-product Shopify theme. Liquid renders the film and the native
cart; a framework-free three.js bundle progressively enhances the hero into a
scroll-driven product film. Reduced-motion and no-WebGL visitors get the fully
purchasable "static cut" automatically.

Built against the handoff package in [`/docs`](./docs).

## Connecting to your store (GitHub → Themes)

1. In Shopify admin: **Online Store → Themes → Add theme → Connect from GitHub**.
2. Pick this repo and the branch **`claude/final-website-shopify-setup-oieyjz`**
   (the branch these files live on). Shopify imports the theme.
3. **Customize** the theme → in **Theme settings → Product**, choose your
   **DeskPaws product**. This wires the "Get DeskPaws" buttons, the price, and
   the JSON-LD. (Create the product first if you haven't: $79, compare-at $99,
   handle `deskpaws`, and upload your product photos to its media gallery.)
4. **Preview**, then **Publish** when happy.

That's it — the film is the home page, checkout is Shopify's own.

## Theme settings (Customize → Theme settings)

- **Product** — the DeskPaws product (required for cart + price + SEO).
- **The 3D stage**
  - *Enable the cinematic 3D stage* — off = static cut only.
  - *Model + texture base URL* — where the GLBs + fur textures live. Defaults
    to this public repo via jsDelivr. To self-host, upload the four files from
    [`/models`](./models) to **Content → Files** and paste the folder URL.
  - *Fur render level* — `c` (clean baked grey) is the safe default; try `b`
    on real hardware.
- **Film media** — paste Shopify Files CDN URLs for the Higgsfield assets
  (HF-P01, HF-V05, HF-V06a, HF-V07, HF-P08, HF-P11). Empty = labelled
  placeholder; the site stays fully functional. HF-V06b/c ship by default.

## Media

- 3D models + fur textures live in [`/models`](./models) and are served to the
  browser via jsDelivr (pinned to a commit). Shopify's `assets/` folder does
  not accept `.glb`/`.mp4`, which is why these live outside it.
- Videos/images for the film scenes are set via theme settings (Shopify Files
  URLs). Upload big files in **Content → Files** — no 30 MB chat limit there.

## Developing the 3D stage

The stage is TypeScript in [`/src-stage`](./src-stage), bundled to
`assets/deskpaws-stage.js` with esbuild. The UI behaviours
(`assets/deskpaws-ui.js`) and styles (`assets/deskpaws.css`) are hand-authored
assets — no build step.

```bash
npm install
npm run build      # bundle src-stage → assets/deskpaws-stage.js
npm run watch      # rebuild on change
node build/harness.mjs   # local render harness on :4599 (dev only)
```

Commit the rebuilt `assets/deskpaws-stage.js` — Shopify serves it as-is.

## Structure

```
layout/theme.liquid          shell: fonts, grain, atmosphere, stage mounts, JSON-LD
sections/                    header + the 11 scenes (schema-editable)
templates/index.json         assembles the film
templates/*.liquid           product, cart, 404, page, collection, search, …
snippets/                    media-slot, silhouette, cart-toast
assets/deskpaws.css          the design system (dependency-free)
assets/deskpaws-ui.js        reveals, native AJAX cart, lazy video
assets/deskpaws-stage.js     the three.js film (built from src-stage/)
src-stage/                   stage source (poses, sequences, nodes, rig, …)
models/                      GLBs + fur textures (served via jsDelivr)
config/                      theme + section settings
docs/                        the handoff package (creative direction, specs, copy)
```

## Launch checklist (do not ship without)

- [ ] DeskPaws product created + selected in Theme settings.
- [ ] Replace the placeholder review cards in `sections/reviews.liquid` with
      genuinely collected reviews (only the `D., VERIFIED BUYER` card is real).
- [ ] Upload the Higgsfield film assets to Content → Files and set the Film
      media URLs (or accept the labelled placeholders at launch).
- [ ] Verify the clamp/fur on real hardware; revisit fur level `b` if desired.

## Roadmap (remaining film moments)

Phase D adds: the paw-typed headline (Scene 02), the two match cuts
(3D↔footage, Scenes 05 & 11), the exploded engineering view + surface ritual
(Scene 04) and the knob micro-loop (Scene 09) on the live stage, and the intro
line-draw mark. The static cut already covers all of these as posters/copy.
