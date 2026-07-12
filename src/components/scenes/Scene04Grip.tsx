import { SceneNumeral } from "../ui/SceneNumeral";
import { Reveal } from "../ui/Reveal";
import { StaticFrame } from "../ui/StaticFrame";

/**
 * The Grip — the centerpiece. Phase 3 mounts the scroll-scrubbed exploded
 * view + surface ritual here. The Static Cut renders the exploded engineering
 * plate as a real <dl> (a11y requirement, build spec §8) — annotations map
 * 1:1 to the shipped 3D objects; labels verbatim from the copy deck.
 */
const PARTS = [
  {
    n: "01",
    label: "PLUSH TOP",
    copy: "Cloud-soft. Unzips, machine-washes gentle.",
  },
  {
    n: "02",
    label: "MESH CRADLE",
    copy: "Breathable weave. Holds shape, stays cool.",
  },
  {
    n: "03",
    label: "STEEL CLAMP & FRAME",
    copy: "One piece. Holds 22 kg — your cat is not 22 kg.",
  },
  {
    n: "04",
    label: "STAR-KNOB SCREW",
    copy: "Hand-tight, tool-free. Padded jaws, zero desk marks.",
  },
] as const;

const SURFACES = ["Walnut.", "White oak.", "Marble.", "Steel."] as const;

export function Scene04Grip() {
  return (
    <section
      aria-label="Engineering — the clamp"
      data-scene="04"
      className="scene-surface overflow-hidden bg-bone-deep px-6 py-28 md:px-12 md:py-40"
    >
      <SceneNumeral n="04" />
      <div className="mx-auto w-full max-w-6xl">
        <span className="mono-label opacity-60">ENGINEERING / 01–04</span>

        <div className="mt-10 grid gap-12 md:grid-cols-[7fr_5fr]">
          <div data-stage="explode">
            <StaticFrame
              id="scene04"
              alt="Exploded view: plush top, mesh cradle, steel clamp and frame, star-knob screw"
              aspect={4 / 3}
              frame={2}
            />
          </div>

          <Reveal>
            <dl className="flex h-full flex-col justify-center">
              {PARTS.map((part) => (
                <div
                  key={part.n}
                  className="border-t hairline py-5 first:border-t-0"
                >
                  <dt className="mono-label flex items-baseline gap-3">
                    <span className="opacity-40">{part.n}</span>
                    <span>{part.label}</span>
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink/80">
                    {part.copy}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Movement C — the surface ritual (Phase 3 makes this live on the
            desk mesh; the Static Cut states the compatibility proof). */}
        <Reveal className="mt-20 border-t hairline pt-10">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
            {SURFACES.map((s) => (
              <span
                key={s}
                className="font-display text-2xl font-bold tracking-tight text-ink/70"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
            <span className="mono-label">FITS EDGES 20–75 MM</span>
            {/* honesty as a design element: the struck glass */}
            <span className="mono-label inline-flex items-center gap-3 opacity-70">
              <svg
                aria-hidden
                viewBox="0 0 28 18"
                className="h-4 w-auto text-ink"
                fill="none"
              >
                <rect
                  x="1"
                  y="1"
                  width="26"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="18"
                  x2="28"
                  y2="0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>NOT FOR GLASS DESKS</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
