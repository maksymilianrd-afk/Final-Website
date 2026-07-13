"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The Ink Layer — "Whisker Marks" (creative direction §1.5). One coherent
 * second voice: hand-drawn strokes that draw themselves once, like a designer
 * annotating proofs with a fountain pen. Hard budget: five placements
 * sitewide; the hero owns two (underline + annotation-arrow).
 */

function useStrokeDraw(delayMs: number) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    for (const p of paths) {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = reduced ? "0" : String(len);
    }
    if (reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setTimeout(() => {
          for (const p of paths) {
            const dur = Number(p.dataset.dur ?? 600);
            p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.65, 0, 0.35, 1)`;
            p.style.strokeDashoffset = "0";
          }
        }, delayMs);
      },
      { threshold: 0.4 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, [delayMs]);
  return ref;
}

/** Hand-drawn underline beneath one emotional word — imperfect, slightly
 * overshooting (600ms, once). Wrap the word. */
export function InkUnderline({ children }: { children: ReactNode }) {
  const ref = useStrokeDraw(1000); // after the masked reveal settles
  return (
    <span className="relative inline-block">
      {children}
      <svg
        ref={ref}
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-[-2%] h-[0.14em] w-[106%] text-ink"
        fill="none"
      >
        <path
          data-dur="600"
          d="M3 9 C40 4.5, 95 10.5, 148 6.5 C170 5, 187 6.5, 197 4"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeWidth: "2.5px" }}
        />
      </svg>
    </span>
  );
}

/**
 * The hero's one charm beat: a curved hand-drawn arrow to the star knob with
 * a handwritten note (§1.5.3). Draws 1.2s after the headline; ≥1024px only —
 * the pose contract that anchors its target doesn't hold when stacked.
 */
export function InkAnnotation({
  note,
  className,
}: {
  note: string;
  className?: string;
}) {
  const ref = useStrokeDraw(2200);
  return (
    <span
      className={`pointer-events-none absolute hidden lg:flex flex-col items-start gap-1 ${className ?? ""}`}
    >
      <span className="font-ink text-[14px] leading-tight text-ink/80">
        {note}
      </span>
      <svg
        ref={ref}
        aria-hidden
        viewBox="0 0 120 70"
        className="h-[70px] w-[120px] text-ink/70"
        fill="none"
      >
        {/* curved arrow, fountain-pen imperfect */}
        <path
          data-dur="900"
          d="M6 6 C30 30, 62 52, 104 56"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          data-dur="250"
          d="M93 62 C97 60, 101 58, 105 56 C102 53, 99 50, 97 47"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
