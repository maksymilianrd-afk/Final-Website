"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Wordmark } from "./Wordmark";

/**
 * Detached floating pill — never a full-width bar (creative direction Sc.01).
 * The small "Get DeskPaws" pill appears once the reader is past The Turn
 * (copy deck: persistent after Scene 03).
 */
export function Nav() {
  const qty = useCartStore((s) => s.qty);
  const [pastTurn, setPastTurn] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("scene-03");
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.boundingClientRect.top < 0) setPastTurn(true);
      },
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const scrollToCta = () => {
    document
      .getElementById("product-cta")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Primary"
        className="flex w-full max-w-2xl items-center justify-between gap-6 rounded-full border hairline bg-bone/70 py-2.5 pl-5 pr-3 backdrop-blur-md"
      >
        <a href="#top" className="flex items-center gap-2" aria-label="DeskPaws — home">
          <Wordmark />
        </a>
        <div className="flex items-center gap-1 text-sm">
          <a
            href="#scene-03"
            className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-ink/5 sm:block"
          >
            Story
          </a>
          <a
            href="#scene-08"
            className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-ink/5 sm:block"
          >
            Reviews
          </a>
          <a
            href="#scene-10"
            className="hidden rounded-full px-3 py-1.5 transition-colors hover:bg-ink/5 sm:block"
          >
            FAQ
          </a>
          <span className="mono-label px-2 opacity-60" aria-live="polite">
            Cart ({qty})
          </span>
          {pastTurn ? (
            <button
              type="button"
              onClick={scrollToCta}
              className="ml-1 hidden rounded-full bg-ink px-4 py-1.5 text-sm text-bone transition-colors hover:bg-signal sm:block"
            >
              Get DeskPaws
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
