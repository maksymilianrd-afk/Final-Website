/**
 * Shopify Storefront API — headless cart → checkoutUrl redirect (build spec §1).
 * Server-only: the token never reaches the client. When env is missing the
 * site stays fully browsable and the cart runs in "preview" mode.
 */
import "server-only";

const API_VERSION = "2025-07";

const domain = process.env.SHOPIFY_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
const PRODUCT_HANDLE = process.env.SHOPIFY_PRODUCT_HANDLE ?? "deskpaws";

export const isConfigured = Boolean(domain && token);

async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!domain || !token) throw new Error("Shopify env not configured");
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    // Cart mutations must never be cached; product reads revalidate hourly.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Storefront API ${res.status}`);
  const json = (await res.json()) as { data: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

/* ── product ── */

export type ProductInfo = {
  variantId: string | null;
  title: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  available: boolean;
};

/** Static fallback matching the copy deck — used until the store is wired. */
export const PRODUCT_FALLBACK: ProductInfo = {
  variantId: null,
  title: "DeskPaws",
  price: 79,
  compareAtPrice: 99,
  currency: "USD",
  available: true,
};

export async function getProduct(): Promise<ProductInfo> {
  if (!isConfigured) return PRODUCT_FALLBACK;
  try {
    const data = await storefront<{
      product: {
        title: string;
        variants: {
          nodes: {
            id: string;
            availableForSale: boolean;
            price: { amount: string; currencyCode: string };
            compareAtPrice: { amount: string } | null;
          }[];
        };
      } | null;
    }>(
      `query Product($handle: String!) {
        product(handle: $handle) {
          title
          variants(first: 1) {
            nodes {
              id
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount }
            }
          }
        }
      }`,
      { handle: PRODUCT_HANDLE },
    );
    const variant = data.product?.variants.nodes[0];
    if (!data.product || !variant) return PRODUCT_FALLBACK;
    return {
      variantId: variant.id,
      title: data.product.title,
      price: Number(variant.price.amount),
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice.amount)
        : null,
      currency: variant.price.currencyCode,
      available: variant.availableForSale,
    };
  } catch {
    return PRODUCT_FALLBACK;
  }
}

/* ── cart ── */

export type CartInfo = {
  id: string;
  qty: number;
  checkoutUrl: string;
};

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
`;

type CartPayload = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
};

function toCartInfo(cart: CartPayload): CartInfo {
  return { id: cart.id, qty: cart.totalQuantity, checkoutUrl: cart.checkoutUrl };
}

export async function cartCreate(variantId: string): Promise<CartInfo> {
  const data = await storefront<{
    cartCreate: { cart: CartPayload };
  }>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } }
    }`,
    { lines: [{ merchandiseId: variantId, quantity: 1 }] },
  );
  return toCartInfo(data.cartCreate.cart);
}

export async function cartAddLine(
  cartId: string,
  variantId: string,
): Promise<CartInfo> {
  const data = await storefront<{
    cartLinesAdd: { cart: CartPayload | null };
  }>(
    `mutation CartAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } }
    }`,
    { cartId, lines: [{ merchandiseId: variantId, quantity: 1 }] },
  );
  if (!data.cartLinesAdd.cart) throw new Error("cart expired");
  return toCartInfo(data.cartLinesAdd.cart);
}

export async function cartGet(cartId: string): Promise<CartInfo | null> {
  try {
    const data = await storefront<{ cart: CartPayload | null }>(
      `query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`,
      { id: cartId },
    );
    return data.cart ? toCartInfo(data.cart) : null;
  } catch {
    return null;
  }
}
