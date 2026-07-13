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

  // Scene 01 — the carry (hero scroll-out)
  ScrollTrigger.create({
    trigger: '[data-scene="01"]',
    start: "top top",
    end: "bottom 25%",
    onUpdate: (s) => set(1, s.progress),
    onEnter: () => paint(1),
    onEnterBack: () => paint(1),
  });

  // Scene 02 — waiting in the wings
  ScrollTrigger.create({
    trigger: '[data-scene="02"]',
    start: "top 40%",
    end: "bottom 40%",
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

  // Scenes 04–11 — background direction + stage hand-off
  const rest: Array<[number, string]> = [
    [4, '[data-scene="04"]'],
    [5, '[data-scene="05"]'],
    [6, '[data-scene="06"]'],
    [7, '[data-scene="07"]'],
    [8, '[data-scene="08"]'],
    [9, '[data-scene="09"]'],
    [10, '[data-scene="10"]'],
    [11, '[data-scene="11"]'],
  ];
  for (const [id, sel] of rest) {
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
