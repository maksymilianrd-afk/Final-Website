"use client";

import { useCartStore } from "@/stores/cartStore";

/** Quiet confirmation strip + checkout affordance. No drawer theatrics —
 * this store sells one product; the cart is a count and a door. */
export function CartToast() {
  const { toast, qty, checkoutUrl, configured } = useCartStore();

  if (!toast && qty === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
    >
      <div className="flex items-center gap-4 rounded-full border hairline bg-bone/85 px-5 py-3 shadow-[0_8px_30px_rgba(20,18,16,0.12)] backdrop-blur">
        <span className="text-sm">
          {toast ?? `Cart · ${qty} item${qty === 1 ? "" : "s"}`}
        </span>
        {configured && checkoutUrl ? (
          <a
            href={checkoutUrl}
            className="rounded-full bg-ink px-4 py-1.5 text-sm text-bone transition-colors hover:bg-signal"
            onClick={() => {
              import("@/lib/analytics").then(({ track }) =>
                track("begin-checkout"),
              );
            }}
          >
            Checkout
          </a>
        ) : (
          <span className="mono-label opacity-50">checkout connects at launch</span>
        )}
      </div>
    </div>
  );
}
