import { SceneNumeral } from "../ui/SceneNumeral";
import { MaskedLine, Reveal } from "../ui/Reveal";
import { StaticFrame } from "../ui/StaticFrame";

/**
 * The Turn — Phase 2 replaces the still with the scroll-scrubbed dock
 * sequence. Static Cut: keyframe still (pending from the 3D chat) + copy.
 */
export function Scene03Turn() {
  return (
    <section
      id="scene-03"
      aria-label="Meet DeskPaws"
      className="relative overflow-hidden bg-bone px-6 py-28 md:px-12 md:py-40"
    >
      <SceneNumeral n="03" side="left" />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
        <div data-stage="dock">
          <StaticFrame
            id="scene03"
            alt="The DeskPaws clamp docking onto a walnut desk edge"
            aspect={4 / 3}
          />
        </div>
        <Reveal>
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold leading-[0.95] tracking-tighter">
            <MaskedLine>Meet DeskPaws.</MaskedLine>
          </h2>
          <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-ink/80">
            A basket for the cat. A clamp for the desk. Peace for both of you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
