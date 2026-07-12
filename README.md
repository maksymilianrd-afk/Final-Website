# DeskPaws — the website

A one-take product film the visitor operates with their scroll. Built against
the handoff package in [`/docs`](./docs) — read those in numeric order;
`05_WEBSITE_BUILD_SPEC.md` is the build's contract, `02`/`02b` win any
conflict about the 3D assets.

## Stack

Next.js 15 (App Router, RSC shell) · React 19 · three + React Three Fiber +
drei · GSAP ScrollTrigger + Lenis · Tailwind v4 · Zustand · Shopify
Storefront API (headless cart → checkout redirect).

## Running

```bash
npm install
cp .env.example .env.local   # fill in Shopify credentials
npm run dev
```

Without Shopify env vars the site runs in preview mode: fully browsable, cart
counts locally, checkout shows "connects at launch".

## Build phases (spec §10)

1. ✅ **Skeleton & commerce** — the Static Cut: all 11 scenes, real copy,
   cart/checkout, FAQ, reviews. Launchable.
2. ⬜ **The Stage** — GLB tiering/loader, pose table, Lenis + ScrollTrigger,
   hero idle + scroll-carry, the dock.
3. ⬜ **The centerpiece** — exploded grip, annotations, desk surface ritual.
4. ⬜ **The film moments** — paw-typed headline, fur match cut, the mirror,
   the last frame, intro mark.
5. ⬜ **Polish & forks** — mobile pass, analytics, easing audit.

## Asset status

- `public/models/` — both GLB tiers ✅ (validated: docs/06)
- `public/media/` — HF-V06b/c ✅ · HF-P01, HF-V05, HF-V06a, HF-V07, HF-P08,
  HF-P11 pending (labeled placeholders render until they land; URLs live in
  `src/lib/media.ts`)
- Fonts — Archivo variable (display) + Geist (body/mono) self-hosted;
  PP Neue Montreal slot ready when licensed.

## Launch gates (do not ship without)

- Replace placeholder review cards in `Scene08Reviews.tsx` with genuinely
  collected reviews (the `D., VERIFIED BUYER` card is the only real one).
- Wire `SHOPIFY_DOMAIN` / `SHOPIFY_STOREFRONT_TOKEN` and a `deskpaws` product.
- Point `metadataBase` at the real domain.
