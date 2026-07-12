"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Adds `.in-view` when the element enters the viewport — drives the CSS
 * masked line reveals in the Static Cut. GSAP replaces this in Phase 4.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "blockquote";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("in-view");
            io.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/** A display line that rises out of an overflow mask, staggered by index. */
export function MaskedLine({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <span
      className={`masked-line ${className ?? ""}`}
      style={{ "--line-index": index } as React.CSSProperties}
    >
      <span>{children}</span>
    </span>
  );
}
