/**
 * The single media manifest — every asset URL on the site resolves through
 * this table (build spec §9). Pending assets carry `pending: true` and render
 * as labeled, aspect-correct placeholders; swapping in a real URL later is a
 * one-line change (e.g. a Shopify Files CDN URL).
 */
export type MediaAsset = {
  /** Asset id from the Higgsfield brief (03) */
  id: string;
  kind: "image" | "video";
  src?: string;
  poster?: string;
  /** width / height */
  aspect: number;
  alt: string;
  pending?: boolean;
};

export const MEDIA = {
  /** Scene 01 hero fallback poster + OG image (locked: b1a80dd5 / 5f94f9eb) */
  heroPoster: {
    id: "HF-P01",
    kind: "image",
    aspect: 16 / 9,
    alt: "DeskPaws basket clamped to a walnut desk edge, floating in a beige studio",
    pending: true,
  },
  /** Scene 05 fur macro — match-cut centerpiece (locked: 9d2a47b4; arrives via Shopify Files) */
  furMacro: {
    id: "HF-V05",
    kind: "video",
    aspect: 16 / 9,
    alt: "Extreme macro of light-grey plush fur moving in a gentle air current",
    pending: true,
  },
  /** Scene 06 — the three cat clips */
  elevation: {
    id: "HF-V06a",
    kind: "video",
    aspect: 4 / 3,
    alt: "A grey cat steps up from a chair into the DeskPaws basket",
    pending: true, // the one asset still open in Higgsfield
  },
  enclosure: {
    id: "HF-V06b",
    kind: "video",
    src: "/media/HF-V06b.mp4",
    aspect: 4 / 3,
    alt: "A cat circles and curls into the plush basket, seen from above",
  },
  proximity: {
    id: "HF-V06c",
    kind: "video",
    src: "/media/HF-V06c.mp4",
    aspect: 4 / 3,
    alt: "A cat asleep in the basket, one paw draped over the rim toward the desk",
  },
  /** Scene 07 — the evening film (locked: 5fe83f47; arrives via Shopify Files) */
  eveningFilm: {
    id: "HF-V07",
    kind: "video",
    aspect: 16 / 9,
    alt: "Evening desk scene: lamplight, a cat asleep in the DeskPaws basket, work finished",
    pending: true,
  },
  /** Scene 08 — the one UGC photo card (locked: a5799bbe) */
  ugcCard: {
    id: "HF-P08",
    kind: "image",
    aspect: 4 / 5,
    alt: "Customer photo of a cat in the DeskPaws basket at a real desk",
    pending: true,
  },
  /** Scene 11 — the last-frame match photo (locked: bf71dd1a) */
  lastFrame: {
    id: "HF-P11",
    kind: "image",
    aspect: 16 / 9,
    alt: "The DeskPaws basket docked on a walnut desk fragment in a beige studio",
    pending: true,
  },
} satisfies Record<string, MediaAsset>;
