"use client";

import { useTransition } from "react";
import { addToCart } from "@/app/actions";
import { track } from "@/lib/analytics";
import { useCartStore } from "@/stores/cartStore";

/**
 * The one CTA — one label per intent, sitewide (creative direction Scene 11).
 * Pill, ink on bone; hover deepens toward --signal; nested arrow chip
 * translates 4px on hover.
 */
export function CtaButton({
  label,
  sublabel,
  size = "md",
}: {
  label: string;
  sublabel?: string;
  size?: "md" | "lg";
}) {
  const [pending, startTransition] = useTransition();
  const store = useCartStore();

  const onClick = () => {
    track("add-to-cart");
    startTransition(async () => {
      const state = await addToCart();
      if (state.configured) {
        useCartStore.setState({
          qty: state.qty,
          checkoutUrl: state.checkoutUrl,
          configured: true,
        });
      } else {
        // Preview mode — local count keeps the flow demonstrable pre-launch.
        useCartStore.setState((s) => ({ qty: s.qty + 1, configured: false }));
      }
      store.showToast("Added. One desk, about to get quieter.");
    });
  };

  return (
    <div className="inline-flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`group inline-flex items-center gap-3 rounded-full bg-ink text-bone transition-colors duration-300 hover:bg-signal disabled:opacity-60 ${
          size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base"
        }`}
        style={{ transitionTimingFunction: "var(--ease-camera)" }}
      >
        <span className="font-medium tracking-tight">{label}</span>
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-full bg-bone/15 transition-transform duration-300 group-hover:translate-x-1"
          style={{ transitionTimingFunction: "var(--ease-camera)" }}
        >
          →
        </span>
      </button>
      {sublabel ? <span className="mono-label opacity-60">{sublabel}</span> : null}
    </div>
  );
}
