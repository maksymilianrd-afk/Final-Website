"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { SCENE_BG } from "@/lib/poses";
import { useSceneStore } from "@/stores/sceneStore";

/**
 * Scroll choreography (build spec §3/§6): Lenis smooth scroll feeds GSAP
 * ScrollTrigger; triggers write {sceneId, progress} into useSceneStore and
 * tween the fixed background layer between scene colors. Scene 03 pins for
 * 2 viewport-heights while the dock scrubs.
 *
 * Only mounted when the stage is active — the Static Cut never pins.
 */
export function ScrollDirector({
  backgroundRef,
}: {
  backgroundRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const setScene = (sceneId: number, progress: number) =>
      useSceneStore.setState({ sceneId, progress });

    const bg = (sceneId: number) => {
      if (!backgroundRef.current) return;
      gsap.to(backgroundRef.current, {
        backgroundColor: SCENE_BG[sceneId] ?? SCENE_BG[1],
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const triggers: ScrollTrigger[] = [];

    // ── Scene 01: the carry — hero scroll-out drives the un-dock ──
    triggers.push(
      ScrollTrigger.create({
        trigger: "#top",
        start: "top top",
        end: "bottom 25%",
        onUpdate: (self) => setScene(1, self.progress),
        onEnter: () => bg(1),
        onEnterBack: () => bg(1),
      }),
    );

    // ── Scene 02: waiting in the wings (starts late so the carry plays) ──
    triggers.push(
      ScrollTrigger.create({
        trigger: '[data-scene="02"]',
        start: "top 40%",
        end: "bottom 40%",
        onUpdate: (self) => setScene(2, self.progress),
        onEnter: () => bg(2),
        onEnterBack: () => bg(2),
      }),
    );

    // ── Scene 03: pinned 2vh — the dock scrub ──
    triggers.push(
      ScrollTrigger.create({
        trigger: "#scene-03",
        start: "top top",
        end: "+=200%",
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => setScene(3, self.progress),
        onEnter: () => bg(3),
        onEnterBack: () => bg(3),
      }),
    );

    // ── Scenes 04–11: background direction + stage hand-off ──
    const rest: Array<[number, string]> = [
      [4, '[data-scene="04"]'],
      [5, '[data-scene="05"]'],
      [6, '[data-scene="06"]'],
      [7, '[data-scene="07"]'],
      [8, "#scene-08"],
      [9, '[data-scene="09"]'],
      [10, "#scene-10"],
      [11, "#product-cta"],
    ];
    for (const [id, sel] of rest) {
      triggers.push(
        ScrollTrigger.create({
          trigger: sel,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => {
            setScene(id, 0);
            bg(id);
          },
          onEnterBack: () => {
            setScene(id, 0);
            bg(id);
          },
        }),
      );
    }

    // Scene 01 hover magnetism: normalized pointer X.
    const onPointer = (e: PointerEvent) => {
      useSceneStore.setState({
        pointerX: (e.clientX / window.innerWidth) * 2 - 1,
      });
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      triggers.forEach((t) => t.kill());
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [backgroundRef]);

  return null;
}
