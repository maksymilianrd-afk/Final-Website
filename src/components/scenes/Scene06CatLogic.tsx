import { MEDIA } from "@/lib/media";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";

/**
 * "Will my cat actually use it?" — the #1 objection gets the calm chapter.
 * Deliberately minimal animation; the calm IS the message.
 */
const PASSAGES = [
  {
    title: "Elevation.",
    copy: "Cats survey. Desk height is throne height.",
    asset: MEDIA.elevation,
  },
  {
    title: "Enclosure.",
    copy: "Curved walls read as safety. Bowls beat mats, every time.",
    asset: MEDIA.enclosure,
  },
  {
    title: "Proximity.",
    copy: "They don't want your keyboard. They want you.",
    asset: MEDIA.proximity,
  },
] as const;

export function Scene06CatLogic() {
  return (
    <section
      aria-label="Will my cat actually use it?"
      data-scene="06"
      className="scene-surface bg-bone px-6 py-28 md:px-12 md:py-40"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-[5fr_7fr]">
        <div className="md:sticky md:top-32 md:self-start">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.98] tracking-tighter">
              Will my cat actually use it?
            </h2>
            <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-ink/80">
              Almost certainly — and here&rsquo;s the biology.
            </p>
          </Reveal>
        </div>

        <div className="flex flex-col gap-20">
          {PASSAGES.map((p, i) => (
            <Reveal key={p.title} className="grid items-center gap-6 sm:grid-cols-2">
              <div className={i % 2 === 1 ? "sm:order-2" : undefined}>
                <MediaSlot asset={p.asset} className="w-full rounded-sm" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 max-w-[30ch] text-base leading-relaxed text-ink/80">
                  {p.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* candor bar: name the fear, then eat it */}
      <Reveal className="mx-auto mt-24 max-w-6xl border-y hairline py-5">
        <p className="mono-label text-center leading-relaxed">
          MOST CATS CLAIM IT WITHIN A DAY · 30-DAY &ldquo;SHE IGNORED IT&rdquo;
          RETURNS
        </p>
      </Reveal>
    </section>
  );
}
