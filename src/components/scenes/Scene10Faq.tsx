/**
 * Quiet answers — deliberately plain after nine scenes of cinema. Native
 * disclosure semantics, hairline dividers, 350ms height ease, a thin +
 * rotating 90°. No other animation.
 */
const FAQS = [
  {
    q: "Will it fit my desk?",
    a: "Any edge between 20 and 75 mm thick — solid wood, laminate, marble, metal. Not glass: the clamp grips hard, and glass doesn't like being gripped.",
  },
  {
    q: "How much weight does it hold?",
    a: "Tested to 22 kg. The average cat is 4–5 kg. Even a very committed Maine Coon has a comfortable margin.",
  },
  {
    q: "Will it scratch my desk?",
    a: "No. Both jaws are felt-padded, and the knob is hand-tightened — you control the pressure. No marks, no residue.",
  },
  {
    q: "What if my cat ignores it?",
    a: "Give it a day, and try a pinch of catnip in the basket — most cats claim it within 24 hours. If yours holds out for 30 days, send it back. Full refund, no questions, no guilt.",
  },
  {
    q: "Can I wash it?",
    a: "Yes. The plush cover unzips off the frame and machine-washes on a gentle cycle. Air-dry, fluff, zip back on.",
  },
  {
    q: "Is there any assembly?",
    a: "About three minutes, no tools: slip the cover over the frame, zip it closed, clamp it to your desk. Everything you need is in the box.",
  },
  {
    q: "Can I fold it out of the way?",
    a: "Yes — lift the basket and press the side button, and it folds flat against the desk edge. One click down, one lift back up. The clamp stays put.",
  },
  {
    q: "Does it work on standing desks?",
    a: "Yes — just give the knob a check-turn after big height changes. The clamp doesn't mind the ride.",
  },
  {
    q: "Shipping?",
    a: "Dispatched within 48 hours, tracked, free over $60. 30-day returns from the day it arrives.",
  },
] as const;

export function Scene10Faq() {
  return (
    <section
      id="scene-10"
      aria-label="FAQ"
      className="bg-bone px-6 py-28 md:py-36"
    >
      <div className="mx-auto w-full max-w-[680px]">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tighter">
          Quiet answers.
        </h2>
        <div className="mt-10">
          {FAQS.map((item) => (
            <details key={item.q} className="faq group border-t hairline last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
                <span className="text-lg font-medium tracking-tight">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="faq-plus text-xl font-light text-ink/50"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[60ch] pb-6 text-base leading-relaxed text-ink/75">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FAQS };
