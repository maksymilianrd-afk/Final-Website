/** Scroll choreography — Lenis smooth scroll feeds GSAP ScrollTrigger, which
 * writes {sceneId, progress} into the shared state and tweens the background
 * director between scene colours. Scene 03 pins for 2 viewport-heights. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SCENE_BG } from "./poses";
import { state } from "./state";

export function initScroll(bg: HTMLElement): void {
  gsap.registerPlugin(ScrollTrigger);

  // Mobile hardening (Fix 5): don't refresh/thrash on the height-only resize a
  // collapsing address bar fires. (We deliberately do NOT call normalizeScroll
  // here — it fights Lenis for scroll control. And note this whole path is
  // desktop-only: phones get the contained hero, which has no ScrollTrigger.)
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({ lerp: 0.12 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const paint = (id: number) =>
    gsap.to(bg, {
      backgroundColor: SCENE_BG[id] ?? SCENE_BG[1],
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });

  const set = (id: number, p: number) => {
    state.sceneId = id;
    state.progress = p;
  };

  // Scene 01 — the carry (hero scroll-out). Ends exactly where 02 begins so the
  // two onUpdate handlers can never both be writing the shared state (Fix 4):
  // "bottom top" fires when the hero's bottom reaches the viewport top — the
  // same boundary as scene 02's "top top". Adjacent, not overlapping.
  ScrollTrigger.create({
    trigger: '[data-scene="01"]',
    start: "top top",
    end: "bottom top",
    onUpdate: (s) => set(1, s.progress),
    onEnter: () => paint(1),
    onEnterBack: () => paint(1),
  });

  // Scene 02 — waiting in the wings. Begins exactly where 01 ended.
  ScrollTrigger.create({
    trigger: '[data-scene="02"]',
    start: "top top",
    end: "bottom top",
    onUpdate: (s) => set(2, s.progress),
    onEnter: () => paint(2),
    onEnterBack: () => paint(2),
  });

  // Scene 03 — pinned dock scrub
  ScrollTrigger.create({
    trigger: '[data-scene="03"]',
    start: "top top",
    end: "+=200%",
    pin: true,
    anticipatePin: 1,
    onUpdate: (s) => set(3, s.progress),
    onEnter: () => paint(3),
    onEnterBack: () => paint(3),
  });

  // Scene 04 — the centerpiece (Fix 1). Pinned for four viewport-heights so
  // there's a runway to scrub the explode → reassemble.
  ScrollTrigger.create({
    trigger: '[data-scene="04"]',
    start: "top top",
    end: "+=400%",
    pin: true,
    anticipatePin: 1,
    onUpdate: (s) => set(4, s.progress),
    onEnter: () => paint(4),
    onEnterBack: () => paint(4),
  });

  // Scene 09 — how it works: the star knob turns through its detents as you
  // scroll past (Fix 1). Scrubbed, not pinned.
  ScrollTrigger.create({
    trigger: '[data-scene="09"]',
    start: "top top",
    end: "bottom top",
    onUpdate: (s) => set(9, s.progress),
    onEnter: () => paint(9),
    onEnterBack: () => paint(9),
  });

  // Content scenes — DOM media owns the frame. 05–08 and 10 fade the product
  // out (pose canvasOpacity 0); 11 brings it back beside the CTA. Their poses
  // ignore progress, so a plain enter/enter-back claim of the scene is enough.
  const content: Array<[number, string]> = [
    [5, '[data-scene="05"]'],
    [6, '[data-scene="06"]'],
    [7, '[data-scene="07"]'],
    [8, '[data-scene="08"]'],
    [10, '[data-scene="10"]'],
    [11, '[data-scene="11"]'],
  ];
  for (const [id, sel] of content) {
    ScrollTrigger.create({
      trigger: sel,
      start: "top 55%",
      end: "bottom 45%",
      onEnter: () => {
        set(id, 0);
        paint(id);
      },
      onEnterBack: () => {
        set(id, 0);
        paint(id);
      },
    });
  }

  // Scene 01 hover magnetism
  window.addEventListener(
    "pointermove",
    (e) => {
      state.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    },
    { passive: true },
  );
}
