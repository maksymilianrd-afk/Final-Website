# DESKPAWS — CINEMATIC CREATIVE DIRECTION
### Master document · v2.0 · 2026-07-09 · aligned to shipped 3D assets (02_3D_MODEL_SPEC v2.0 FINAL)
**Read this first. Every other document in the package executes something defined here.**

---

## 0. THE BIG IDEA

**The website is a one-take product film that the visitor operates with their scroll.**

There is exactly one main character — the DeskPaws basket — rendered as a persistent 3D object that lives in a fixed WebGL layer *above* the page. It never leaves the screen between the hero and the final CTA. Sections do not "contain" the product; the product travels *through* the sections, and each scene is one continuous camera move around it. Text, UI and background scenery scroll and change behind it, like sets rotating behind an actor who stays on stage.

Twice — and only twice — the 3D model hands off to real footage through a **match cut** (the frame composition of the 3D render and the AI video are identical at the moment of crossfade). Once into the fur macro (Scene 5), once into the final lifestyle photograph (Scene 11). This "geometry explains, film seduces" handoff is the single most expensive-feeling trick on the site, and it's what separates it from every scroll-jacked Shopify page.

**The emotional spine** (straight from the market research):
The site does not sell a cat bed. It sells the end of a daily tug-of-war. Structure = the classic three acts:

- **Act I — The Conflict** (Scenes 1–2): you love them, you also have a deadline.
- **Act II — The Machine** (Scenes 3–5): the product proves itself, part by part.
- **Act III — The Peace** (Scenes 6–11): the same desk, transformed.

**The one-sentence pitch of the experience:** *You scroll, and you watch a small piece of engineering quietly solve an emotional problem.*

---

## 1. ART DIRECTION

### 1.1 Palette (locked — matches the existing photo library)
| Token | Value | Use |
|---|---|---|
| `--bone` | `#EDE7DE` | Primary background, studio void |
| `--bone-deep` | `#E3DACC` | Section variation, cards |
| `--walnut` | `#6B4F3A` | Desk surfaces, warm accents in imagery only |
| `--ink` | `#141210` | Text, clamp, nav, buttons |
| `--plush` | `#C9C9C7` | The product's own grey; large numerals, dividers |
| `--night` | `#0E0F14` | Scene 2 (chaos) + Scene 7 (evening calm) backgrounds |
| `--signal` | `#2F5D50` | ONE accent: deep pine green. CTA hover states, "in stock", checkmarks. Nothing else. |

Rules: never a gradient as decoration. Never brass/gold. A 3% film-grain overlay sits on a fixed, pointer-events-none layer across the whole site — the "shot on film" texture that makes flat beige feel physical.

### 1.2 Typography
- **Display:** a wide grotesk with real character — *PP Neue Montreal* (primary) or *Söhne Breit* (alternate). Set tight: `tracking-tighter`, `leading-[0.95]`. No serif anywhere; warmth comes from the palette and the fur, not from a serif.
- **Body/UI:** *Neue Montreal* regular / *Geist* fallback. 16–18px, `leading-relaxed`, max-width 60ch.
- **Technical labels** (exploded view annotations, spec numbers): *Geist Mono*, 11px, uppercase, `tracking-[0.18em]` — the only small-caps treatment on the site, reserved for engineering moments so it reads as "spec sheet", not decoration.
- Numerals are a design element: giant scene numbers (`01`, `02`…) in `--plush` at 20vw sit behind content on select scenes, barely darker than the background — the film's "slate/clapperboard" motif.

### 1.3 Motion language (the site-wide physics)
- One master easing for everything camera-like: `cubic-bezier(0.16, 1, 0.3, 1)` (heavy ease-out, like a weighted dolly settling).
- One easing for mechanical actions (clamp, screw, exploded view): `cubic-bezier(0.65, 0, 0.35, 1)` — symmetric, machined, precise.
- Text never fades in from nothing. It enters as **masked line reveals**: each line slides up 100% from inside an overflow-hidden box, staggered 60ms per line. On dark scenes the mask reveal is paired with a 4px blur→0 resolve.
- Nothing loops infinitely except (a) the product's idle "breathing" rotation (±1.5° over 9s) and (b) the review drift rail. Everything else animates once, on scroll position.
- `prefers-reduced-motion`: all pinned scroll scenes collapse into static keyframe images with normal scrolling. This is a hard requirement, not a nice-to-have.

### 1.4 What we refuse to do (anti-cheap list)
No parallax-for-its-own-sake. No particle systems. No cursor trails. No tilt-on-hover cards. No confetti. No emoji. No icon grids. No purple. No fake urgency timers. Every animation must either **explain the product**, **advance the story**, or **prove quality**. If it does none of these, cut it.

---

## 2. THE FILM — SCENE BY SCENE

> Scroll budget notation: "3vh pinned" = the section pins to the viewport and consumes 3 viewport-heights of scroll while its internal animation scrubs. Total page ≈ 22–26 viewport-heights of scroll. That's a 60–90 second film at natural scroll pace.

---

### SCENE 00 — THE INTRO MARK (loading, ≤ 2.5s, skippable)

**Looks like:** Pure `--bone` screen. A single thin ink line (1.5px) draws itself left-to-right in one continuous stroke: it traces the product's *side-profile silhouette* — the shallow bowl curve, dipping down, then the sharp right-angle geometry of the clamp hook, the vertical drop of the screw. One pen stroke, ~1.4s. The stroke is literally the product's engineering drawing. As it completes, the line "inflates": the bowl portion plumps with a soft spring (fur implied through thickness, not texture), the wordmark **DESKPAWS** resolves beneath it via masked reveal, and the whole mark scales down 40% and glides to the top-left corner where it *becomes the nav logo*. The hero is already loaded behind it.

**Alternate (the cat-scratch idea, refined so it's premium not childish):** three soft parallel strokes — not jagged cartoon scratches but *plush-embossed* grooves, like a paw dragged through deep fur — wipe diagonally across the bone screen, each stroke revealing a strip of the hero image beneath. Third stroke completes the reveal. Use only if the line-draw feels too austere in testing. **Never both.**

**Why it works:** the intro *is* the product diagram. It plants the silhouette in memory before a single word, and the logo-morph means zero dead time — the load screen was secretly the first shot of the film.
**Mistake to avoid:** any progress bar, any percentage counter, any duration over 2.5s. If assets load faster, cut the animation short and go.

---

### SCENE 01 — ARRIVAL (Hero · 1vh + 1vh of scroll-out)

**Looks like:** A `--bone` studio void with a barely-visible floor shadow — the exact world of your existing product photography. Right two-thirds: the **3D model, fully assembled, clamped to a floating fragment of walnut desk edge** (the desk-proxy sub-object, cut like a museum cross-section, edges softly rounded — the desk is a prop that travels with the actor). The product idles: ±1.5° slow yaw, shadow breathing with it. Left third, vertically centered:

- Headline (2 lines, masked line reveals, 400ms after intro morph):
  **"Your cat stays close.**
  **Your desk stays calm."**
- Sub (max 16 words): *"The plush basket that clamps to your desk — so nobody sits on the keyboard."*
- One CTA, pill, ink on bone: **"Get DeskPaws — $79"** with a nested circular arrow chip that translates 4px on hover. Below it in mono-label style: `SHIPS IN 48H · 30-DAY HOME TRIAL`.
- Bottom center: a thin vertical line + `SCROLL` label; the line "drips" downward 12px on a 2.4s loop — the only scroll cue on the page.

**UI:** Nav is a detached floating pill (top center-left: wordmark; right: `Story / Reviews / FAQ / Cart(0)`), backdrop-blurred bone at 70% opacity. Never a full-width bar.

**On hover (product):** cursor over the 3D canvas gently magnetizes camera yaw ±4° toward pointer. Subtle — a museum piece responding to your presence, not a toy.

**On scroll (the transition that sells the whole site):** the headline and CTA slide up and out with the page, but **the product does not scroll away**. It detaches from the page flow, the desk fragment slides off-screen left, and the basket — now free-floating — begins a slow forward tumble as the background deepens from `--bone` toward `--night`. The visitor has just "picked the product up" and is carrying it into the story. This is the moment they realize the site is not a normal page.

**Feel:** instant comprehension + "wait, did it just come with me?"
**Understand:** what it is, what it costs, that it's premium.
**Conversion role:** 5-second clarity test passed; CTA above the fold; the scroll-carry creates the curiosity that earns the next 60 seconds.
**Mistakes to avoid:** more than 4 text elements in the hero. Auto-rotating carousels. Any second CTA.

---

### SCENE 02 — 4:47 PM, TUESDAY (The Problem · 2.5vh pinned · dark)

**Looks like:** Background now `--night`. The 3D basket has drifted to the far right edge, small, dim, *waiting in the wings* — visible but not lit (the character hasn't entered the scene yet). Center stage: a huge block of display type, bone-on-night, that reads like a document being written:

> **"The quarterly report is due at five.**
> **You are focused. You are flowing. You are—"**

**The signature animation — The Paw-Typed Headline:** mid-sentence, invisible paw-steps walk across the type. One by one, five letterforms in the line get "stepped on": each pressed letter squashes vertically (scaleY 0.72, 90ms, machined easing), kicks out a subtle soft-shadow bloom beneath it like weight on fur, and corrupts into gibberish. The line finishes itself as:

> **"You are focu— TGFFFF8F4$$"**

…the real customer quote from the research. The gibberish characters are set in the same display face but knocked to `--plush` grey, glitchless, elegant. A blinking text cursor keeps blinking after the `$$` — deadpan. Below, small, after a 600ms beat, one quiet line fades up:

> *"You love them. You also have a deadline."*

**While scrolling (the scrub):** scroll progress drives the walk — the visitor's own scrolling *is* the cat walking across the sentence. Reverse scroll un-steps the letters. This makes the visitor complicit in the chaos, which is exactly the emotion (it's their cat, their keyboard).

Around the headline, at 15% opacity, drifting UI ghosts: a Slack notification, a Zoom "You are muted", a calendar block — desk-life debris, slowly floating like dust, never legible enough to actually read. No cat is ever shown. **The cat is present only as consequence** — pressed letters, a warm blur that pads across the far background once. Absence is more premium (and more universal — it's *every* cat).

**Transition out:** the last scroll beat "selects all" the gibberish (bone highlight sweep) and deletes it. The screen holds empty for half a beat. Then Scene 03.

**Feel:** laughing recognition. This is the "you know that thing where your cat…" move the research demands — name the experience before selling the fix.
**Understand:** we know your exact 4:47 PM.
**Luxury because:** restraint. One typographic idea executed perfectly instead of a chaotic collage.
**Conversion role:** problem-naming in the customer's own viral language ("TGFFFF8F4$$" is literally quoted from the community) creates the nod that pre-sells the solution.
**Mistakes to avoid:** stock photos of cats on keyboards. Comic sound effects. Making the gibberish glitchy/techy — it must stay typographic and calm.

---

### SCENE 03 — THE TURN (Product entrance · 2vh pinned)

**Looks like:** The empty night screen exhales back to `--bone` in a slow luminance sweep (bottom-up, like morning). The walnut desk-edge fragment glides in from the left and locks to center-left of frame, seen slightly from below — heroic angle. Then **the entrance:** the 3D basket, which has been waiting dim at frame right, lights up (studio key light fades on), glides in, and **docks**.

**The Dock — the most important 4 seconds on the site (scroll-scrubbed):**
1. The basket approaches, clamp jaws open, top plate hovering 3cm above the desk surface.
2. Top plate lowers and *kisses* the desk — flush, a 2px settle.
3. Camera drops 20° to below-edge view: the vertical clamp body hugs the desk edge; the lower plate swings under.
4. The silver screw spins upward — thread by thread, visibly mechanical — and the black star knob rotates 270° with three subtle rotational "clicks" (tiny 1-frame holds in the rotation curve read as tactile detents).
5. Full-frame micro-shake of 1px on the final click: *locked*. The basket's fur does one soft settle-jiggle from the impulse — soft physics meeting hard physics in a single frame.

Headline (masked reveal, right side): **"Meet DeskPaws."** Sub: *"A basket for the cat. A clamp for the desk. Peace for both of you."*

**Hover:** none. This scene is watched, not touched.
**Transition:** camera begins a slow orbital move around the docked product — directly into Scene 04 with **no section boundary**. Scenes 03–04–05 are one continuous shot.

**Feel:** relief + "oh, that's clever."
**Understand:** what it is and how it holds — before a single spec is written.
**Conversion role:** installation-anxiety (objection #3 in the research) is disarmed *visually* before it's ever verbalized.
**Mistakes to avoid:** showing the dock as a video instead of scrubbed 3D — scrubbing lets nervous buyers replay the mechanism at their own speed, which is the entire trust value.

---

### SCENE 04 — THE GRIP (Clamp + engineering, merged Features section · 4vh pinned · the centerpiece)

This replaces both "Clamp/Installation" and the boring icon-grid "Features" section. It is one continuous scroll-controlled 3D sequence in three movements.

**Movement A — The Orbit into Macro (1vh):** the camera swings from the heroic wide into a tight macro on the clamp — the exact framing of your `63f9e521` reference photo. Background dims to `--bone-deep`; a soft vignette focuses the mechanism. Mono-label fades in top-left: `ENGINEERING / 01–04`.

**Movement B — The Exploded Grip (2vh):** the four real objects of the shipped model (`Basket Top`, `Basket Bottom`, `Base Structure.001`, `Screw.001`) separate along clean vertical guides, scrubbed by scroll, staggered so it reads as a technician's hands, not an explosion:
- `Basket Top` lifts 14cm — hairline annotation: `01 · PLUSH TOP — cloud-soft, unzips, machine-washes gentle`
- `Basket Bottom` rises beneath it, revealing the weave — `02 · MESH CRADLE — breathable weave, holds shape, stays cool`
- `Base Structure.001` (clamp + frame, one welded piece) shifts forward and tilts 12° to present its C-profile — `03 · STEEL CLAMP & FRAME — one piece, holds 22 kg. Your cat is not 22 kg.`
- `Screw.001` unthreads two turns and hovers — `04 · STAR-KNOB SCREW — hand-tight, tool-free. Padded jaws, zero desk marks.`

*(Note for reviewers: the inner frame and clamp are a single merged object in the shipped asset — the annotation copy embraces this as "one piece", which is truthfully also the stability story.)*

Annotations are 1px ink hairlines with mono labels, drawing on in sequence — an exploded engineering plate come to life. Each annotation line is also the *progress indicator*: four lines, four scroll beats. Copy stays under 10 words per part; the specs carry the persuasion ("22 kg" answers the chonky-cat objection with a number, per research objection #2).

**Movement C — The Surface Ritual (1vh):** parts glide back together (reverse dock, fast, satisfying), camera pulls to a ¾ view, and the desk fragment performs the compatibility proof: its material **cross-dissolves walnut → white oak → marble → matte black metal**, one per scroll beat, while the clamp visibly stays locked through every change. *(Implementation note: the shipped `Desk` mesh has a single worn-walnut material — the swap is executed by the web build as a runtime PBR-texture crossfade, per Build Spec §5. If the alternate sets read poorly on the desk's UVs at the Phase-3 quality gate, the ritual falls back to walnut-only plus the mono compatibility line — the struck-glass beat stays either way.)* A mono counter bottom-right ticks the edge-thickness range: `FITS EDGES 20–75 MM`. Final beat: a hairline outline of a glass sheet appears and is struck through — `NOT FOR GLASS DESKS` — honesty as a design element (research says candor converts here).

**Hover (desktop only):** during Movement B, hovering any separated part gently lifts it 6px and brightens its annotation; others dim to 40%. Optional depth for the curious; never required.

**Transition:** on the last surface beat, the camera begins pushing toward the plush rim, past the clamp… into Scene 05, again with no boundary.

**Feel:** "this is a machined product, not an AliExpress toy."
**Understand:** how it attaches, what it fits, what it holds, that it won't mark the desk.
**Luxury because:** an exploded view is the visual language of Leica, Apple and watchmaking. Borrowed correctly, it re-prices the product upward on sight.
**Conversion role:** this single scene answers research objections #2 (sturdy?), #3 (desk damage?), #4 (safe?) and the compatibility FAQ — before the visitor can articulate them.
**Mistakes to avoid:** letting parts fly apart dramatically (it must feel like a technician's hands, not an explosion). More than ~8 words per annotation. Ambient dust/glow effects.

---

### SCENE 05 — THE SOFT HALF (Fabric/comfort · 2.5vh pinned · the match cut)

**Looks like:** The camera continues its push from Scene 04 straight into the plush rim until fur fills 100% of the frame — the 3D fur cards up close, softly lit. At the exact moment the frame is nothing but fur, a **match-cut crossfade (400ms)** swaps the 3D render for the real Higgsfield macro video: identical framing, identical light direction, but now *real* fibers moving with air, light raking through them at golden-hour warmth. The visitor feels the material switch from "understood" to "felt". This is asset `HF-V05` in the Higgsfield brief.

Over the footage, in the top-left, quiet lines reveal one per scroll beat:

> **"The half your cat cares about."**
> *Cloud-plush rim. Breathable mesh cradle — cool in summer, cozy in winter.*
> *Unzips. Machine-washes. Comes back fluffy.*

**Interaction (desktop):** moving the cursor across the video applies a subtle displacement-shader "stroke" — the fur parts faintly along the pointer path and relaxes back over 1.2s. The visitor pets the website. It is the one indulgent interaction on the site, and it lands *exactly* on the product's core promise (softness), so it's allowed.

**Mobile:** the stroke responds to touch-drag instead; if the shader is too heavy, fall back to the plain video (build spec covers the fork).

**Transition:** camera pulls back out of the fur — crossfading back to 3D mid-pull — revealing the full product again, now floating in a warm-lit void. The bowl tilts gently toward the camera like an offering: into Scene 06.

**Feel:** tactile longing. This is where the gift-buyers (secondary persona) convert on visuals alone.
**Understand:** it's genuinely soft, it's washable, the cat side is as considered as the desk side.
**Mistakes to avoid:** skipping the match-cut and just placing a video in a box — the seamlessness *is* the luxury. Over-narrating softness with adjectives; two short lines and the footage do the work.

---

### SCENE 06 — CATS CHOOSE ELEVATION ("Will my cat use it?" · 2vh, normal scroll, calm)

The #1 pre-purchase objection gets its own quiet, confident chapter. Background `--bone`, generous whitespace, the first "normal-feeling" section — deliberate pacing relief after three pinned scenes.

**Layout:** Left column (sticky within the section): headline **"Will my cat actually use it?"** and the honest answer beneath it: *"Almost certainly — and here's the biology."* Right column, three short passages scroll past, each paired with a small inline looping clip (real cat footage, `HF-V06a/b/c`):

1. **Elevation** — *"Cats survey. Desk height is throne height."* — clip: a cat stepping up into the basket from a chair.
2. **Enclosure** — *"Curved walls read as safety. Bowls beat mats, every time."* — clip: a cat doing the circling-then-melt curl.
3. **Proximity** — *"They don't want your keyboard. They want you."* — clip: a cat asleep in the basket, one paw over the rim toward the desk.

Beneath, a single trust bar in mono labels: `MOST CATS CLAIM IT WITHIN A DAY · 30-DAY "SHE IGNORED IT" RETURNS`. Naming the return policy after the fear ("she ignored it") is the candor move — it tells the buyer we've seen the failure case and we'll eat it.

**Animation:** intentionally minimal — masked text reveals, clips fade in at 60% viewport. The calm *is* the message.
**Conversion role:** kills objection #1 with science + social proof + guarantee stacked in one screen.
**Mistake to avoid:** cartoon cat illustrations or "9/10 cats" fake stats.

---

### SCENE 07 — 5:12 PM, REVISITED (Lifestyle/emotion · 3vh pinned · the mirror)

**The structural rhyme that makes the site feel authored:** this scene mirrors Scene 02 shot-for-shot, resolved.

**Looks like:** Background returns to `--night` — but warm night now: the Higgsfield evening lifestyle film (`HF-V07`, built from your existing dark-scene photography style: walnut desk, brass lamp glow, deep charcoal wall). The basket is clamped at the desk edge, a cat asleep inside, lamplight pooling on the fur. No human visible — just an open laptop, a cooling cup, a finished document on screen. The same drifting UI ghosts from Scene 02 appear — but this time the Slack ghost reads `✓ sent`, the calendar block reads `✓ done`, and they fade out one by one as the visitor scrolls, like the day resolving itself.

The display type returns, completing the Scene 02 sentence at last, one masked line per scroll beat, slow, David-Whyte pacing:

> **"The report goes out at 4:58."**
> **"The cat never left."**
> **"Nobody got pushed away."**

Last line holds alone on screen for a full beat before the transition. That third line is the deepest nerve in the research (guilt), and it gets the most silence.

**Transition:** the lamp in the footage dims slightly and the camera drifts toward the sleeping cat — dissolving into Scene 08's paper texture.

**Feel:** the exhale. This is the "dream outcome" scene the research describes verbatim: glance over, cat is there, work is done.
**Conversion role:** paints life-after-purchase; emotional buyers convert here, rational ones in Scene 04. Both roads lead to the same CTA.
**Mistakes to avoid:** adding a CTA inside this scene (it would cheapen the moment — the film isn't over); any music-video cutting. One shot, slow.

---

### SCENE 08 — SAID AT DESK HEIGHT (Reviews · 1.5vh, drift rail)

**Looks like:** `--bone-deep` background. Headline small and off-hand: **"Said at desk height."** Below it, a full-bleed horizontal rail of oversized quote cards drifts leftward on its own at ~18px/s — reading pace, not marquee pace. Each card: bone paper texture, a 2px ink top-border, the quote set large in the display face, and a mono attribution line that includes the **cat's name and weight**:

> *"She completely ignores my desk now."* — `CARRIE + LUNA, 4.4 KG`
> *"Meowcro-management: solved."* — `DANA + JULES, 6.1 KG`
> *"He's in it before I clock in."* — `LISA + GUS, 5.7 KG`
> *"Best WFH purchase I've made."* — `TAYLOR + FELIX, 5.2 KG`

The weights are doing silent engineering work — every card re-proves the clamp (research objection #2) while looking like charm. One card in the rail is not a quote but a **photo card**: real UGC-style shot of a cat in the basket. One is a **stat card**: `★ 4.8 — 1,200+ DESKS QUIETER`.

**Interaction:** hover pauses the drift and lifts the hovered card 8px with a soft tinted shadow; the rail is also drag-scrubbable (grab cursor). On mobile: native swipe momentum.
**Mistakes to avoid:** review-widget UI (stars rows, avatars, "verified buyer" badges everywhere — one badge on the stat card is enough). Speeding the drift up. Fake specificity — use the real customer language from the research pool.

---

### SCENE 09 — THREE TURNS OF A KNOB (How it works · 1.5vh, stepped)

**Looks like:** near-whitespace. Left: three steps in a vertical list, the active one at full ink, others at 25%. Right: a small, tight 3D viewport (the model's final cameo) playing the matching micro-loop:

1. **Hook it.** — clamp jaws slide over the desk edge. `10 SECONDS`
2. **Turn it.** — the star knob does its 270° with the three detent clicks. `3 TURNS`
3. **Done.** — the fur settle-jiggle; a cat-shaped soft shadow drops into the bowl. `0 TOOLS`

Scroll (or click a step) scrubs between the three states. The mono time-labels do the "it's genuinely easy" persuasion in six characters each.

**The fold coda (real product feature — one-click folding, confirmed in the supplier listing):** after step 3 completes, a quiet fourth line appears below the list, smaller, unnumbered: *"Need the space back? Lift, press the side button — it folds flat against the desk."* `MONO: 1 CLICK`. **v2.0 status: text-only at launch.** The 3D fold animation is blocked because the shipped model merges clamp and frame into one object (02 §5.1); the copy stays because the feature is real. When the 3D chat splits `Base Structure.001`, the fold animation drops in behind the `FEATURES.fold3D` flag with zero layout change. This line still answers the small-apartment buyer and reframes the product from "permanent fixture" to "considerate object".

**Transition:** the 3D viewport's product scales up out of its frame and glides down-page ahead of the visitor — leading them into the FAQ like an usher. Small moment, big authored feel.

---

### SCENE 10 — QUIET ANSWERS (FAQ · normal scroll, deliberately plain)

Single column, max-width 680px, hairline dividers. Accordion rows open with a 350ms height ease and a 90° rotation of a thin `+`. **No other animation.** After nine scenes of cinema, plainness reads as confidence.

Contents (from research Part 6/7 + verified listing facts): desk fit & thickness (20–75mm, not glass), weight rating (22 kg / 50 lbs, confirmed), desk damage (padded jaws), cleaning (cover unzips, gentle machine wash), first-time assembly (slip cover over frame, zip, clamp — ~3 min, no tools), one-click fold-away, "what if my cat ignores it" (30-day return, pinch-of-catnip tip), shipping & tracking, standing-desk note (fine — retighten after height changes). Exact wording lives in the copy deck.

---

### SCENE 11 — THE LAST FRAME (Final CTA · 1.5vh)

**Looks like:** the film's closing shot. The 3D product, docked on the walnut fragment, centered in `--bone` void — the hero composition returned, full circle. Then the second **match cut**: the render crossfades into the *real photograph* of the identical composition (your `4c765bc3` family / asset `HF-P11`). The product the visitor has been "carrying" for ninety seconds becomes, in one dissolve, the physical object that will arrive at their door. That dissolve is the argument.

Copy, centered, minimal:

> **"Give them their spot."**
> **DeskPaws — $79** ~~$99~~ · launch price
> [ **Get DeskPaws** → ]
> `SHIPS IN 48H · 30-DAY HOME TRIAL · FREE RETURNS`

The CTA pill is the same one from the hero (same label — one label per intent, sitewide). On hover it deepens toward `--signal`. Beneath, tiny: payment icons, contact email, a one-line footer. As the very last element on the page, the intro's line-drawing replays once in miniature next to the wordmark — the film's end-card, closing the loop with Scene 00.

**Mistakes to avoid:** a fat multi-column footer full of links (this store sells one product — the footer is one quiet line). Countdown timers. "Only 3 left."

---

## 3. THE FIVE SIGNATURE ANIMATIONS (memorability ranking)

1. **The Paw-Typed Headline** (Sc.02) — the shareable one. People will screen-record it.
2. **The Dock** (Sc.03) — the conversion one. Installation anxiety dies here.
3. **The Exploded Grip + Surface Ritual** (Sc.04) — the "this is engineered" one. Re-prices the product.
4. **The Fur Match Cut + pettable shader** (Sc.05) — the expensive-feeling one.
5. **The Mirror** (Sc.02 ↔ Sc.07 rhyme) — the authored one. Nobody's Shopify theme has narrative structure.

**Most important for conversion:** #2, #3, then the Scene 06 candor bar.
**Most important for perceived value:** #4, #3, the match cut in Scene 11, and the film-grain + easing discipline sitewide.

## 4. ASSET ROUTING MAP (what renders each scene)

| Scene | 3D model | Higgsfield video | Higgsfield photo | Pure UI/type |
|---|---|---|---|---|
| 00 Intro | silhouette source | — | — | ● line draw |
| 01 Hero | ● live, docked | — | fallback poster | headline |
| 02 Problem | ● dim, waiting | — | — | ● paw-type |
| 03 The Turn | ● dock sequence | — | — | — |
| 04 The Grip | ● exploded + surfaces | — | — | annotations |
| 05 Soft Half | ● push-in half | ● HF-V05 fur macro | — | — |
| 06 Cat Logic | — | ● HF-V06 a/b/c cat clips | — | text |
| 07 Mirror | — | ● HF-V07 evening film | — | ● type |
| 08 Reviews | — | — | ● 1 UGC card | ● cards |
| 09 How-to | ● micro-loops | — | — | steps |
| 10 FAQ | — | — | — | ● |
| 11 Last Frame | ● docked | — | ● HF-P11 match photo | CTA |

Mobile swaps every scroll-scrubbed 3D sequence for pre-rendered scrubbed video (see Build Spec §6) — same film, lighter projector.

## 5. WHY THIS WINS AWWWARDS *AND* CONVERTS
Award juries score originality, craft, and content coherence — the paw-typed headline, the match cuts, and the mirrored act structure are the originality; the two locked easings, mono annotation system and grain are the craft. Buyers, meanwhile, get every research objection answered *in order of purchase anxiety* (what is it → will it break my desk → is it sturdy → is it soft → will my cat use it → is this seller real), each answered by *showing* rather than claiming. The film and the funnel are the same object. That's the whole trick.
