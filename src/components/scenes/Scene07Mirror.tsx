import { MEDIA } from "@/lib/media";
import { MediaSlot } from "../ui/MediaSlot";
import { MaskedLine, Reveal } from "../ui/Reveal";

/**
 * 5:12 PM, revisited — the shot-for-shot mirror of Scene 02, resolved.
 * The ghost UI returns with everything checked off. No CTA in this scene —
 * the film isn't over.
 */
export function Scene07Mirror() {
  return (
    <section
      aria-label="5:12 PM, revisited — the resolution"
      className="on-night relative overflow-hidden bg-night px-6 py-32 text-bone md:px-12 md:py-44"
    >
      {/* the evening film underlays the type once HF-V07 lands */}
      <div aria-hidden className="absolute inset-0 opacity-40" data-stage="evening">
        <MediaSlot asset={MEDIA.eveningFilm} className="h-full w-full object-cover" />
      </div>

      {/* the same ghosts as Scene 02 — resolved */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <span className="mono-label absolute left-[12%] top-[18%] opacity-15">
          ✓ sent
        </span>
        <span className="mono-label absolute right-[14%] top-[36%] opacity-15">
          ✓ done
        </span>
      </div>

      <Reveal className="relative mx-auto max-w-4xl">
        <p className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.15] tracking-tighter">
          <MaskedLine index={0}>The report goes out at 4:58.</MaskedLine>
          <MaskedLine index={2}>The cat never left.</MaskedLine>
          <MaskedLine index={4}>Nobody got pushed away.</MaskedLine>
        </p>
      </Reveal>
    </section>
  );
}
