/**
 * Analytics event seam (build spec phase 5 wires a real destination).
 * Events: scene-reached-01..11, dock-completed, add-to-cart, begin-checkout,
 * tier-served.
 */
type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: string, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event, ...props });
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, props);
  }
}
