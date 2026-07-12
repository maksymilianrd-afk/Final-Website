import { MEDIA } from "@/lib/media";
import { MediaSlot } from "../ui/MediaSlot";
import { Reveal } from "../ui/Reveal";

/**
 * "Said at desk height." — oversized quote cards on a drag-scrollable rail
 * (<ul> semantics; Phase 4 adds the 18px/s drift + hover-pause). The cat
 * weights in the attributions silently re-prove the clamp on every card.
 *
 * ⚠️ LAUNCH GATE (copy deck Scene 08): the named-cat cards are placeholder
 * lines from category research and must be replaced with genuinely collected
 * reviews before launch. The `D., VERIFIED BUYER` card is the exception —
 * a real verified review of this product (supplier listing, 14 Jun 2026).
 */
const QUOTES = [
  { quote: "She completely ignores my desk now.", who: "CARRIE + LUNA, 4.4 KG" },
  { quote: "Meowcro-management: solved.", who: "DANA + JULES, 6.1 KG" },
  { quote: "He's in it before I even clock in.", who: "LISA + GUS, 5.7 KG" },
  {
    quote: "Best purchase I've made for working from home.",
    who: "TAYLOR + FELIX, 5.2 KG",
  },
  { quote: "I can actually get things done.", who: "PRIYA + MOCHI, 3.9 KG" },
  {
    quote:
      "Very good quality, very easy installation — comes with everything you need.",
    who: "D., VERIFIED BUYER · JUNE 2026",
    verified: true,
  },
] as const;

export function Scene08Reviews() {
  return (
    <section
      id="scene-08"
      aria-label="Reviews"
      className="relative overflow-hidden bg-bone-deep py-28 md:py-36"
    >
      <Reveal className="mx-auto max-w-6xl px-6 md:px-12">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink/70">
          Said at desk height.
        </h2>
      </Reveal>

      <ul
        className="rail mt-10 flex snap-x gap-6 overflow-x-auto px-6 pb-6 md:px-12"
        aria-label="Customer reviews"
      >
        {QUOTES.slice(0, 3).map((q) => (
          <QuoteCard key={q.who} {...q} />
        ))}

        {/* the one photo card — deliberately 20% less produced */}
        <li className="w-[19rem] shrink-0">
          <div className="h-full border-t-2 border-ink bg-bone shadow-sm">
            <MediaSlot asset={MEDIA.ugcCard} className="w-full" />
          </div>
        </li>

        {QUOTES.slice(3).map((q) => (
          <QuoteCard key={q.who} {...q} />
        ))}

        {/* the one stat card — one badge is enough */}
        <li className="w-[19rem] shrink-0">
          <div className="flex h-full flex-col justify-center gap-3 border-t-2 border-ink bg-ink p-7 text-bone">
            <span className="font-display text-4xl font-bold tracking-tighter">
              ★ 4.8
            </span>
            <span className="mono-label text-bone/70">
              1,200+ DESKS QUIETER
            </span>
          </div>
        </li>
      </ul>
    </section>
  );
}

function QuoteCard({
  quote,
  who,
  verified,
}: {
  quote: string;
  who: string;
  verified?: boolean;
}) {
  return (
    <li className="w-[22rem] shrink-0">
      <blockquote className="flex h-full flex-col justify-between gap-8 border-t-2 border-ink bg-bone p-7 shadow-sm">
        <p className="font-display text-[1.65rem] font-bold leading-[1.12] tracking-tight">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="mono-label flex items-center gap-2 text-ink/60">
          {who}
          {verified ? (
            <span aria-label="verified" className="text-signal">
              ✓
            </span>
          ) : null}
        </footer>
      </blockquote>
    </li>
  );
}
