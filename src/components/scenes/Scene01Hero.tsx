import { MEDIA } from "@/lib/media";
import { CtaButton } from "../ui/CtaButton";
import { MediaSlot } from "../ui/MediaSlot";
import { MaskedLine, Reveal } from "../ui/Reveal";

export function Scene01Hero() {
  return (
    <section
      id="top"
      aria-label="DeskPaws"
      className="relative flex min-h-svh items-center overflow-hidden bg-bone px-6 pt-24 pb-16 md:px-12"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-2">
        <Reveal className="order-2 md:order-1">
          <h1 className="font-display whitespace-nowrap text-[clamp(1.7rem,3.4vw,3.4rem)] font-bold leading-[0.95] tracking-tighter">
            <MaskedLine index={0}>Your cat stays close.</MaskedLine>
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

        {/* The stage: Phase 2 mounts the persistent WebGL actor here.
            Until then, the HF-P01 poster holds the exact composition. */}
        <div className="order-1 md:order-2" data-stage="hero">
          <MediaSlot
            asset={MEDIA.heroPoster}
            className="w-full"
            sizes="(min-width: 768px) 58vw, 100vw"
          />
        </div>
      </div>

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
