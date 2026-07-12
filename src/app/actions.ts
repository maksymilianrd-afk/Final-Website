"use server";

import { cookies } from "next/headers";
import {
  cartAddLine,
  cartCreate,
  cartGet,
  getProduct,
  isConfigured,
} from "@/lib/shopify";

const CART_COOKIE = "deskpaws_cart";

export type CartState = {
  configured: boolean;
  qty: number;
  checkoutUrl: string | null;
};

export async function addToCart(): Promise<CartState> {
  if (!isConfigured) {
    // Preview mode: the UI keeps a local count; checkout connects at launch.
    return { configured: false, qty: 0, checkoutUrl: null };
  }
  const product = await getProduct();
  if (!product.variantId) {
    return { configured: false, qty: 0, checkoutUrl: null };
  }
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;

  let cart = null;
  if (existing) {
    try {
      cart = await cartAddLine(existing, product.variantId);
    } catch {
      cart = null; // expired/invalid cart → create fresh
    }
  }
  cart ??= await cartCreate(product.variantId);

  jar.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 14,
  });
  return { configured: true, qty: cart.qty, checkoutUrl: cart.checkoutUrl };
}

export async function readCart(): Promise<CartState> {
  if (!isConfigured) return { configured: false, qty: 0, checkoutUrl: null };
  const jar = await cookies();
  const id = jar.get(CART_COOKIE)?.value;
  if (!id) return { configured: true, qty: 0, checkoutUrl: null };
  const cart = await cartGet(id);
  return {
    configured: true,
    qty: cart?.qty ?? 0,
    checkoutUrl: cart?.checkoutUrl ?? null,
  };
}
