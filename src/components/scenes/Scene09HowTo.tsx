import { FEATURES } from "@/lib/features";
import { Reveal } from "../ui/Reveal";
import { StaticFrame } from "../ui/StaticFrame";

/**
 * Three turns of a knob — Phase 3 wires the 3D micro-loop viewport scrubbing
 * seqKnob/seqDock sub-ranges. Fold coda ships text-only behind FEATURES.fold3D
 * (blocked on the Base Structure.001 split, 02 §5.1) — the copy stays because
 * the feature is real.
 */
const STEPS = [
  { title: "Hook it.", copy: "Slide the clamp over your desk edge.", mono: "10 SECONDS" },
  { title: "Turn it.", copy: "Tighten the star knob until snug.", mono: "3 TURNS" },
  { title: "Done.", copy: "The spot is theirs.", mono: "0 TOOLS" },
] as const;

export function Scene09HowTo() {
  return (
    <section
      aria-label="How it works"
      className="relative bg-bone px-6 py-28 md:px-12 md:py-40"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.98] tracking-tighter">
            Three turns of a knob.
          </h2>
          <ol className="mt-10">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex items-baseline justify-between gap-6 border-t hairline py-5 first:border-t-0"
              >
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    <span className="mr-3 text-ink/30">{i + 1}</span>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-base leading-relaxed text-ink/75">
                    {step.copy}
                  </p>
                </div>
                <span className="mono-label shrink-0 opacity-60">{step.mono}</span>
              </li>
            ))}
          </ol>

          {/* the fold coda — quiet, unnumbered, real */}
          <div className="mt-6 flex items-baseline justify-between gap-6 border-t hairline pt-5">
            <p className="max-w-[42ch] text-sm leading-relaxed text-ink/60">
              Need the space back? Lift, press the side button — it folds flat
              against the desk.
              {FEATURES.fold3D ? null : (
                // 3D fold animation lands behind this flag (02 §5.1)
                <span className="sr-only">
                  {" "}
                  (animation coming when the frame split ships)
                </span>
              )}
            </p>
            <span className="mono-label shrink-0 opacity-60">1 CLICK</span>
          </div>
        </Reveal>

        <div data-stage="knob">
          <StaticFrame
            id="scene09"
            alt="The star knob turning through its three detents"
            aspect={1}
            frame={2}
          />
        </div>
      </div>
    </section>
  );
}
