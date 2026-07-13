import { MEDIA } from "@/lib/media";
import { CtaButton } from "../ui/CtaButton";
import { InkAnnotation, InkUnderline } from "../ui/Ink";
import { MediaSlot } from "../ui/MediaSlot";
import { MaskedLine, Reveal } from "../ui/Reveal";
import { StageAware } from "../ui/StageAware";

/**
 * Scene 01 v2.1 — the warm still-life (rewritten after first build review):
 * desk anchored right, clamp toward camera, light pooled, plus exactly two
 * ink touches (§1.5) and the mono spec strip. Text column hard-capped at
 * 46vw ≥1024px; the pose registry keeps the basket right of 48vw (§3.5.5).
 */
export function Scene01Hero() {
  return (
    <section
      id="top"
      aria-label="DeskPaws"
      className="scene-surface flex min-h-svh items-center overflow-hidden bg-bone px-6 pt-24 pb-16 md:px-12"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[46fr_54fr]">
        {/* text first: top on mobile (stacked), left column on desktop (§3.5.5) */}
        <Reveal className="lg:max-w-[46vw]">
          <h1 className="font-display whitespace-nowrap text-[clamp(1.7rem,3.3vw,3.3rem)] font-bold leading-[0.95] tracking-tighter">
            <MaskedLine index={0}>
              Your cat stays <InkUnderline>close</InkUnderline>.
            </MaskedLine>
            <MaskedLine index={1}>Your desk stays calm.</MaskedLine>
          </h1>
          <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-ink/80">
            The plush basket that clamps to your desk — so nobody sits on the
            keyboard.
          </p>
          <div className="mt-8">
            <CtaButton
              label="Get DeskPaws — $79"
              sublabel="SHIPS IN 48H · 30-DAY HOME TRIAL"
            />
          </div>
        </Reveal>

        {/* The live actor renders on the fixed canvas behind this column;
            the HF-P01 poster holds the composition until the GLB is ready
            and whenever the stage can't mount (Static Cut). */}
        <div data-stage="hero">
          <StageAware>
            <MediaSlot
              asset={MEDIA.heroPoster}
              className="w-full"
              sizes="(min-width: 1024px) 54vw, 100vw"
            />
          </StageAware>
        </div>
      </div>

      {/* the hero's one charm beat: handwritten note + arrow to the star
          knob (draws 1.2s after the headline; ≥1024px only) */}
      <InkAnnotation
        note="hand-tight — no tools"
        className="left-[62%] top-[47%]"
      />

      {/* quiet substance in the dead lower corner (copy deck v2.1);
          desktop-only — on mobile it would collide with the scroll cue */}
      <p className="mono-label absolute bottom-6 left-6 hidden text-ink/50 md:left-12 lg:block">
        HOLDS 22 KG · FITS EDGES 20–75 MM · WASHABLE
      </p>

      {/* the only scroll cue on the page */}
      <div
        aria-hidden
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="scroll-drip block h-8 w-px bg-ink/50" />
        <span className="mono-label opacity-50">Scroll</span>
      </div>
    </section>
  );
}
