"use client";

import { create } from "zustand";

type CartUI = {
  qty: number;
  checkoutUrl: string | null;
  configured: boolean;
  toast: string | null;
  busy: boolean;
  set: (patch: Partial<Omit<CartUI, "set" | "showToast">>) => void;
  showToast: (message: string) => void;
};

export const useCartStore = create<CartUI>((set) => ({
  qty: 0,
  checkoutUrl: null,
  configured: true,
  toast: null,
  busy: false,
  set: (patch) => set(patch),
  showToast: (message) => {
    set({ toast: message });
    setTimeout(() => set({ toast: null }), 3200);
  },
}));
