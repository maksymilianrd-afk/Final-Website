import { MEDIA } from "@/lib/media";
import { MediaSlot } from "../ui/MediaSlot";
import { MaskedLine, Reveal } from "../ui/Reveal";

/**
 * The Soft Half — Phase 4 wires the 3D→footage match cut and the pettable
 * displacement shader. Static Cut: the fur macro full-bleed with copy.
 */
export function Scene05Soft() {
  return (
    <section
      aria-label="The soft half — fabric and comfort"
      className="relative bg-night"
    >
      <div className="relative" data-stage="fur-matchcut">
        <MediaSlot asset={MEDIA.furMacro} className="w-full" />
        <Reveal className="absolute left-6 top-6 max-w-md md:left-12 md:top-12">
          <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] font-bold leading-[1] tracking-tighter text-bone">
            <MaskedLine>The half your cat cares about.</MaskedLine>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-bone/85">
            Cloud-plush rim. Breathable mesh cradle — cool in summer, cozy in
            winter.
          </p>
          <p className="mt-2 text-base leading-relaxed text-bone/85">
            Unzips. Machine-washes. Comes back fluffy.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
