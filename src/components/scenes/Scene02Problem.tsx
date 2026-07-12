import { Reveal } from "../ui/Reveal";

/**
 * Static Cut of the paw-typed headline (build spec §8: "Scene 02 shows the
 * final corrupted headline as static text"). The scroll-scrubbed paw-walk is
 * Phase 4. Gibberish is typographic and calm — plush grey, no glitch.
 */
export function Scene02Problem() {
  return (
    <section
      aria-label="4:47 PM, Tuesday — the problem"
      data-scene="02"
      className="on-night scene-surface overflow-hidden bg-night px-6 py-32 text-bone md:px-12 md:py-44"
    >
      {/* desk-life debris, 15% opacity, never legible enough to actually read */}
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        <span className="mono-label absolute left-[12%] top-[18%] opacity-15">
          Slack — 3 new
        </span>
        <span className="mono-label absolute right-[14%] top-[38%] opacity-15">
          You are muted
        </span>
        <span className="mono-label absolute right-[20%] bottom-[12%] opacity-15">
          Standup · 5:00 PM
        </span>
      </div>

      <Reveal className="mx-auto max-w-4xl">
        <p className="font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-tighter">
          The quarterly report is due at five.
          <br />
          You are focused. You are flowing. You are focu—{" "}
          <span className="text-plush">
            TGFFFF8F4$$
            <span className="cursor-blink" aria-hidden>
              |
            </span>
          </span>
        </p>
        <p className="mt-12 text-lg leading-relaxed text-bone/70">
          You love them. You also have a deadline.
        </p>
      </Reveal>
    </section>
  );
}
